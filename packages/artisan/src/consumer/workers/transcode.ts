import { WaitingChildrenError } from "bullmq";
import { randomUUID } from "crypto";
import { getLangCode } from "shared/lang";
import { ffprobeQueue, ffmpegQueue } from "../../producer";
import { uploadJson } from "../s3";
import { assert } from "../../assert";
import { getDefaultAudioBitrate, getDefaultVideoBitrate } from "../../defaults";
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

  const inputs = job.data.inputs.map((partial) =>
    mergeInput(partial, probeResult),
  );

  let idx = 1;
  job.data.streams.forEach((partial) => {
    const match = matchInputForStream(partial, inputs);
    if (!match) {
      return;
    }

    job.log(
      `Match found for "${JSON.stringify(partial)}": ${JSON.stringify(match.input)}`,
    );

    assert(job.id);
    ffmpegQueue.add(
      getFfmpegJobName(match.stream),
      {
        input: match.input,
        stream: match.stream,
        segmentSize: job.data.segmentSize,
        assetId: job.data.assetId,
        parentSortIndex: idx,
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

    idx++;
  });
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

function mergeInput(partial: PartialInput, probeResult: FfprobeResult): Input {
  switch (partial.type) {
    case "video": {
      const info = probeResult.video[partial.path];
      assert(info);

      const height = partial.height ?? info.height;
      assert(height, "Failed to retrieve height");

      const framerate = partial.framerate ?? info.framerate;
      assert(framerate, "Failed to retrieve framerate");

      return {
        type: "video",
        path: partial.path,
        height,
        framerate,
      };
    }

    case "audio": {
      const info = probeResult.audio[partial.path];
      assert(info);

      const language = partial.language ?? getLangCode(info.language);
      assert(language, "Failed to retrieve language");

      // Assume when no channel metadata is found, we'll fallback to 2.
      const channels = partial.channels ?? info.channels ?? 2;

      return {
        type: "audio",
        path: partial.path,
        language,
        channels,
      };
    }

    case "text":
      return partial;
  }
}

type MatchItem<T extends Stream["type"]> = {
  type: T;
  stream: Extract<Stream, { type: T }>;
  input: Extract<Input, { type: T }>;
};

type MatchResult = MatchItem<"video"> | MatchItem<"audio"> | MatchItem<"text">;

function mergeStream(partial: PartialStream, input: Input): MatchResult | null {
  if (partial.type === "video" && input.type === "video") {
    const stream: Extract<Stream, { type: "video" }> = {
      ...partial,
      bitrate:
        partial.bitrate ??
        getDefaultVideoBitrate(partial.height, partial.codec),
      framerate: partial.framerate ?? input.framerate,
    };
    return { type: "video", stream, input };
  }
  if (partial.type === "audio" && input.type === "audio") {
    const channels = partial.channels ?? input.channels;
    const stream: Extract<Stream, { type: "audio" }> = {
      ...partial,
      bitrate:
        partial.bitrate ?? getDefaultAudioBitrate(channels, partial.codec),
      language: partial.language ?? input.language,
      channels,
    };
    return { type: "audio", stream, input };
  }
  if (partial.type === "text" && input.type === "text") {
    const stream: Extract<Stream, { type: "text" }> = {
      ...partial,
    };
    return { type: "text", stream, input };
  }
  return null;
}

function matchInputForStream(
  partial: PartialStream,
  inputs: Input[],
): MatchResult | null {
  const mergedStreams = inputs.map((input) => mergeStream(partial, input));

  for (const mergedStream of mergedStreams) {
    if (!mergedStream) {
      continue;
    }

    const { type, stream, input } = mergedStream;

    if (type === "video") {
      if (stream.height > input.height) {
        continue;
      }
    }

    if (type === "audio") {
      if (stream.language !== input.language) {
        continue;
      }

      if (stream.channels > input.channels) {
        continue;
      }
    }

    if (type === "text") {
      if (stream.language !== input.language) {
        continue;
      }
    }

    return mergedStream;
  }

  return null;
}
