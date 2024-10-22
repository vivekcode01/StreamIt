import { FFmpeggy } from "ffmpeggy";
import { getBinaryPath } from "../helpers";
import { TmpDir } from "../tmp-dir";
import type { Job } from "bullmq";
import type { Input, Stream } from "../../types";

const ffprobeBin = await getBinaryPath("ffprobe");

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffprobeBin,
};

export type FfprobeData = {
  params: {
    input: Input;
  };
};

export type FfprobeResult = {
  stream: Stream;
};

async function runJob(
  job: Job<FfprobeData, FfprobeResult>,
  tmpDir: TmpDir,
): Promise<FfprobeResult> {
  return {};
}

export default async function (job: Job) {
  const tmpDir = new TmpDir();
  try {
    return await runJob(job, tmpDir);
  } finally {
    await tmpDir.deleteAll();
  }
}
