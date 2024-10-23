import { FFmpeggy } from "ffmpeggy";
import { getBinaryPath, getInputPath } from "../helpers";
import type { PartialInput } from "../../types";
import type { WorkerCallback } from "../lib/worker-processor";

const ffprobeBin = await getBinaryPath("ffprobe");

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffprobeBin,
};

type VideoInfo = {
  height?: number;
  framerate?: number;
};

type AudioInfo = {
  language?: string;
  channels?: number;
};

export type FfprobeData = {
  inputs: PartialInput[];
  parentSortIndex: number;
};

export type FfprobeResult = {
  video: Record<string, VideoInfo>;
  audio: Record<string, AudioInfo>;
};

export const ffprobeCallback: WorkerCallback<
  FfprobeData,
  FfprobeResult
> = async ({ job, dir }) => {
  const result: FfprobeResult = {
    video: {},
    audio: {},
  };

  const tempDir = await dir.createTempDir();

  for (const input of job.data.inputs) {
    const file = await getInputPath(input, tempDir);
    const info = await FFmpeggy.probe(file.path);

    if (input.type === "video") {
      const stream = info.streams.find(
        (stream) => stream.codec_type === "video",
      );

      const framerate = stream?.avg_frame_rate
        ? parseFrameRate(stream.avg_frame_rate)
        : undefined;

      result.video[input.path] = {
        height: stream?.height,
        framerate,
      };
    }

    if (input.type === "audio") {
      const stream = info.streams.find(
        (stream) => stream.codec_type === "audio",
      );
      result.audio[input.path] = {
        language: stream?.tags.language,
        channels: stream?.channels,
      };
    }

    job.log(`${input.path}: ${JSON.stringify(info)}`);
  }

  return result;
};

function parseFrameRate(avg: string) {
  const fraction = avg.split("/");

  if (fraction[1]?.endsWith("|")) {
    fraction[1] = fraction[1].substring(0, fraction[1].length - 1);
  }

  if (fraction[0] && fraction[1]) {
    return +fraction[0] / +fraction[1];
  }

  if (fraction[0]) {
    return +fraction[0];
  }
}
