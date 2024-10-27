import { WaitingChildrenError } from "bullmq";
import { randomUUID } from "crypto";
import { getLangCode } from "shared/lang";
import { ffprobeQueue, ffmpegQueue } from "../../producer";
import { uploadJson } from "../s3";
import { assert } from "../../assert";
import { getDefaultAudioBitrate, getDefaultVideoBitrate } from "../../defaults";
import { addPackageJob } from "../../producer";
import type { Input, PartialInput, Stream, PartialStream } from "../../types";
import type { Job } from "bullmq";
import type { FfprobeResult } from "./ffprobe";
import type { FfmpegResult } from "./ffmpeg";
import type { Meta } from "../meta";
import type { WorkerCallback } from "../lib/worker-processor";

export type TranscodeData = {
  assetId: string;
  inputs: PartialInput[];
  streams: PartialStream[];
  segmentSize: number;
  packageAfter: boolean;
  tag?: string;
  step?: Step;
};

export type TranscodeResult = {
  assetId: string;
};

enum Step {
  Initial,
  Ffmpeg,
  Meta,
  Finish,
}

export const transcodeCallback: WorkerCallback<
  TranscodeData,
  TranscodeResult
> = async ({ job, token }) => {
  let step = job.data.step ?? Step.Initial;
  while (step !== Step.Finish) {
    switch (step) {
      case Step.Initial: {
        await handleStepInitial(job);
        await job.updateData({
          ...job.data,
          step: Step.Ffmpeg,
        });
        step = Step.Ffmpeg;
        break;
      }

      case Step.Ffmpeg: {
        await handleStepFfmpeg(job, token);
        await job.updateData({
          ...job.data,
          step: Step.Meta,
        });
        step = Step.Meta;
        break;
      }

      case Step.Meta: {
        await handleStepMeta(job, token);

        if (job.data.packageAfter) {
          await addPackageJob({
            assetId: job.data.assetId,
            tag: job.data.tag,
          });
        }

        await job.updateData({
          ...job.data,
          step: Step.Finish,
        });
        step = Step.Finish;
        break;
      }
    }
  }

  return {
    assetId: job.data.assetId,
  };
};

async function handleStepInitial(job: Job<TranscodeData>) {
  const inputs = job.data.inputs.filter(
    (input) => input.type === "video" || input.type === "audio",
  );

  assert(job.id);
  await ffprobeQueue.add(
    "ffprobe",
    {
      inputs,
      parentSortIndex: 0,
    },
    {
      jobId: `ffprobe_${randomUUID()}`,
      failParentOnFailure: true,
      parent: {
        id: job.id,
        queue: job.queueQualifiedName,
      },
    },
  );
}

async function handleStepFfmpeg(job: Job<TranscodeData>, token?: string) {
  await waitForChildren(job, token);

  const [probeResult] = await getChildren<FfprobeResult>(job, "ffprobe");
  assert(probeResult);

  const inputs = mergeInputs(job.data.inputs, probeResult);

  const matches = getMatches(job.data.streams, inputs);

  matches.forEach(([type, stream, input], index) => {
    job.log(
      `Matched ${type}: ${JSON.stringify(stream)} / ${JSON.stringify(input)}`,
    );

    assert(job.id);
    ffmpegQueue.add(
      getFfmpegJobName(stream),
      {
        input,
        stream,
        segmentSize: job.data.segmentSize,
        assetId: job.data.assetId,
        // Start from 1, ffprobe job is always the first sort index.
        parentSortIndex: index + 1,
      },
      {
        jobId: `ffmpeg_${randomUUID()}`,
        failParentOnFailure: true,
        parent: {
          id: job.id,
          queue: job.queueQualifiedName,
        },
      },
    );
  });
}

type MixedMatch<
  S extends { type: Stream["type"] },
  I extends { type: S["type"] },
  T extends S["type"] = "video" | "audio" | "text",
> = T extends S["type"]
  ? [T, Extract<S, { type: T }>, Extract<I, { type: T }>]
  : never;

type Match = MixedMatch<Stream, Input>;

export function mergeStream(
  partial: PartialStream,
  input: Input,
): Stream | null {
  if (partial.type === "video" && input.type === "video") {
    const framerate = partial.framerate ?? input.framerate;

    const bitrate =
      partial.bitrate ?? getDefaultVideoBitrate(partial.height, partial.codec);

    assert(bitrate, defaultReason("video", "bitrate"));

    return {
      ...partial,
      bitrate,
      framerate,
    };
  }

  if (partial.type === "audio" && input.type === "audio") {
    const channels = partial.channels ?? input.channels;

    const bitrate =
      partial.bitrate ?? getDefaultAudioBitrate(channels, partial.codec);

    const language = partial.language ?? input.language;

    assert(bitrate, defaultReason("audio", "bitrate"));

    return {
      ...partial,
      language,
      bitrate,
      channels,
    };
  }

  if (partial.type === "text" && input.type === "text") {
    return { ...partial };
  }

  return null;
}

export function getMatches(
  partials: PartialStream[],
  inputs: Input[],
): Match[] {
  return partials.reduce<Match[]>((acc, partial) => {
    inputs.forEach((input) => {
      const stream = mergeStream(partial, input);
      if (!stream) {
        return;
      }

      // We'll only have merge stream when types match, thus we know
      // for sure stream and input are aligned here.
      const match = [stream.type, stream, input] as Match;

      if (shouldSkipMatch(match)) {
        return;
      }

      acc.push(match);
    });

    return acc;
  }, []);
}

function shouldSkipMatch(match: Match) {
  const [type, stream, input] = match;
  if (type === "video") {
    if (stream.height > input.height) {
      return true;
    }
  }

  if (type === "audio") {
    if (stream.language !== input.language) {
      return true;
    }

    if (stream.channels > input.channels) {
      return true;
    }
  }

  if (type === "text") {
    if (stream.language !== input.language) {
      return true;
    }
  }

  return false;
}

async function handleStepMeta(job: Job<TranscodeData>, token?: string) {
  await waitForChildren(job, token);

  const children = await getChildren<FfmpegResult>(job, "ffmpeg");

  const streams = children.reduce<Record<string, Stream>>((acc, child) => {
    acc[child.name] = child.stream;
    return acc;
  }, {});

  const meta: Meta = {
    version: 1,
    streams,
    segmentSize: job.data.segmentSize,
  };

  await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

  await uploadJson(`transcode/${job.data.assetId}/meta.json`, meta);
}

async function waitForChildren(job: Job, token?: string) {
  assert(token);
  const shouldWait = await job.moveToWaitingChildren(token);
  if (shouldWait) {
    throw new WaitingChildrenError();
  }
}

async function getChildren<T>(job: Job, name: string) {
  const childrenValues = await job.getChildrenValues();
  const entries = Object.entries(childrenValues);

  return entries.reduce<T[]>((acc, [key, value]) => {
    if (!key.startsWith(`bull:${name}`)) {
      return acc;
    }
    acc.push(value as T);
    return acc;
  }, []);
}

function getFfmpegJobName(stream: Stream) {
  const params: string[] = [stream.type];

  if (stream.type === "video") {
    params.push(stream.height.toString());
  }
  if (stream.type === "audio" || stream.type === "text") {
    params.push(stream.language);
  }

  return `ffmpeg(${params.join(",")})`;
}

function mergeInputs(
  partials: PartialInput[],
  probeResult: FfprobeResult,
): Input[] {
  return partials.map((partial) => mergeInput(partial, probeResult));
}

export function mergeInput(
  partial: PartialInput,
  probeResult: FfprobeResult,
): Input {
  if (partial.type === "video") {
    const info = probeResult.video[partial.path];
    assert(info);

    const height = partial.height ?? info.height;
    assert(height, defaultReason("video", "height"));

    const framerate = partial.framerate ?? info.framerate;
    assert(framerate, defaultReason("video", "framerate"));

    return {
      type: "video",
      path: partial.path,
      height,
      framerate,
    };
  }

  if (partial.type === "audio") {
    const info = probeResult.audio[partial.path];
    assert(info);

    const language = partial.language ?? getLangCode(info.language);
    assert(language, defaultReason("audio", "language"));

    // Assume when no channel metadata is found, we'll fallback to 2.
    const channels = partial.channels ?? info.channels ?? 2;

    return {
      type: "audio",
      path: partial.path,
      language,
      channels,
    };
  }

  if (partial.type === "text") {
    return partial;
  }

  throw new Error("Cannot merge input, invalid type.");
}

function defaultReason<T extends Stream["type"]>(
  type: T,
  prop: keyof Extract<Stream, { type: T }>,
) {
  return (
    `Could not extract a default value for "${type}" "${prop.toString()}", ` +
    "You will have to provide it in the stream instead."
  );
}
