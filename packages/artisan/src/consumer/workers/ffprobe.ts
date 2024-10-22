import { FFmpeggy } from "ffmpeggy";
import { getBinaryPath } from "../helpers";
import { TmpDir } from "../tmp-dir";
import { getInput } from "./get-input";
import { getLangCode } from "shared/typebox";
import type { Job } from "bullmq";
import type { Input } from "../../types";
import type { LangCode } from "shared/typebox";

const ffprobeBin = await getBinaryPath("ffprobe");

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffprobeBin,
};

export type FfprobeData = {
  inputs: Input[];
  parentSortIndex: number;
};

export type FfprobeResult = {
  video: Record<
    string,
    {
      width?: number;
      height?: number;
    }
  >;
  audio: Record<string, { language?: LangCode; channels?: number }>;
};

async function runJob(
  job: Job<FfprobeData, FfprobeResult>,
  tmpDir: TmpDir,
): Promise<FfprobeResult> {
  const result: FfprobeResult = {
    video: {},
    audio: {},
  };

  for (const input of job.data.inputs) {
    const inputFile = await getInput(job, tmpDir, input);
    const inputInfo = await FFmpeggy.probe(inputFile.path);

    job.log(`${input.path}: ${JSON.stringify(inputInfo)}`);

    if (input.type === "video") {
      const stream = inputInfo.streams.find(
        (stream) => stream.codec_type === "video",
      );
      result.video[input.path] = {
        width: stream?.width,
        height: stream?.height,
      };
    }
    if (input.type === "audio") {
      const stream = inputInfo.streams.find(
        (stream) => stream.codec_type === "audio",
      );
      result.audio[input.path] = {
        language: getLangCode(stream?.tags.language) ?? undefined,
        channels: stream?.channels,
      };
    }
  }

  return result;
}

export default async function (job: Job) {
  const tmpDir = new TmpDir();
  try {
    return await runJob(job, tmpDir);
  } finally {
    await tmpDir.deleteAll();
  }
}
