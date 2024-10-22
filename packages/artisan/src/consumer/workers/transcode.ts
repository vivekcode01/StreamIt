import { WaitingChildrenError } from "bullmq";
import { randomUUID } from "crypto";
import { ffprobeQueue, ffmpegQueue } from "../../producer";
import { uploadJson } from "../s3";
import type { Input, Stream } from "../../types";
import type { Job } from "bullmq";
import type { FfprobeResult } from "./ffprobe";
import type { FfmpegResult } from "./ffmpeg";
import type { Meta } from "../meta";

export type TranscodeData = {
  step: TranscodeStep;
  assetId: string;
  inputs: Input[];
  streams: Stream[];
  segmentSize: number;
  packageAfter: boolean;
  tag?: string;
};

export type TranscodeResult = {
  assetId: string;
};

export enum TranscodeStep {
  Initial,
  Ffmpeg,
  Meta,
  Finish,
}

/**
 * The transcode job relies on the underlying ffmpeg jobs. It waits until these
 * are finished, and handles the meta.json file.
 * @param job
 * @returns
 */
export default async function (
  job: Job<TranscodeData, TranscodeResult>,
  token?: string,
): Promise<TranscodeResult> {
  if (!job.id) {
    throw new Error("Missing job id");
  }

  const { assetId, inputs } = job.data;

  let step = job.data.step;
  while (step !== TranscodeStep.Finish) {
    switch (step) {
      case TranscodeStep.Initial: {
        await ffprobeQueue.add(
          "ffprobe",
          {
            inputs: inputs.filter(
              (input) => input.type === "video" || input.type === "audio",
            ),
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
        await job.updateData({
          ...job.data,
          step: TranscodeStep.Ffmpeg,
        });
        step = TranscodeStep.Ffmpeg;
        if (!token) {
          throw new Error("No token");
        }
        const shouldWait = await job.moveToWaitingChildren(token);
        if (!shouldWait) {
          throw new Error("We should wait for children");
        }
        throw new WaitingChildrenError();
      }
      case TranscodeStep.Ffmpeg: {
        const childrenValues = await job.getChildrenValues();

        const entries = Object.entries(childrenValues);

        let ffprobeResult: FfprobeResult | undefined;
        for (const [key, value] of entries) {
          if (key.startsWith("bull:ffprobe")) {
            ffprobeResult = value;
            break;
          }
        }

        if (!ffprobeResult) {
          throw new Error("Missing ffprobe result");
        }

        let ffmpegJobIndex = 1;
        for (const stream of job.data.streams) {
          let input: Input | undefined;

          if (stream.type === "video") {
            input = inputs.find((input) => input.type === "video");
          }

          if (stream.type === "audio") {
            input = inputs.find(
              (input) =>
                input.type === "audio" && input.language === stream.language,
            );
          }

          if (stream.type === "text") {
            input = inputs.find(
              (input) =>
                input.type === "text" && input.language === stream.language,
            );
          }

          if (!input) {
            continue;
          }

          // Ffmpeg job start
          const params: string[] = [stream.type];
          if (stream.type === "video") {
            params.push(stream.height.toString());
          }
          if (stream.type === "audio" || stream.type === "text") {
            params.push(stream.language);
          }

          ffmpegQueue.add(
            `ffmpeg(${params.join(",")})`,
            {
              input,
              stream,
              segmentSize: job.data.segmentSize,
              assetId,
              parentSortIndex: ffmpegJobIndex,
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

          ffmpegJobIndex += 1;
        }

        await job.updateData({
          ...job.data,
          step: TranscodeStep.Meta,
        });
        step = TranscodeStep.Meta;
        if (!token) {
          throw new Error("No token");
        }
        const shouldWait = await job.moveToWaitingChildren(token);
        if (!shouldWait) {
          throw new Error("We should wait for children");
        }
        throw new WaitingChildrenError();
      }
      case TranscodeStep.Meta: {
        const childrenValues = await job.getChildrenValues();
        const entries = Object.entries(childrenValues);

        const ffmpegResults: FfmpegResult[] = [];
        for (const [key, value] of entries) {
          if (key.startsWith("bull:ffmpeg")) {
            ffmpegResults.push(value);
          }
        }

        const streams = ffmpegResults.reduce<Record<string, Stream>>(
          (acc, result) => {
            acc[result.name] = result.stream;
            return acc;
          },
          {},
        );

        const meta: Meta = {
          version: 1,
          streams,
          segmentSize: job.data.segmentSize,
        };

        await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

        await uploadJson(`transcode/${assetId}/meta.json`, meta);

        await job.updateData({
          ...job.data,
          step: TranscodeStep.Finish,
        });
        step = TranscodeStep.Finish;
      }
    }
  }

  return {
    assetId,
  };
}
