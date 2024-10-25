import { Queue, FlowProducer } from "bullmq";
import { randomUUID } from "crypto";
import { connection } from "./env";
import { DEFAULT_SEGMENT_SIZE } from "../defaults";
import type { LangCode } from "shared/typebox";
import type { PartialInput, PartialStream } from "../types";
import type { TranscodeData } from "../consumer/workers/transcode";
import type { PackageData } from "../consumer/workers/package";
import type { FfmpegData } from "../consumer/workers/ffmpeg";
import type { FfprobeData } from "../consumer/workers/ffprobe";

export const flowProducer = new FlowProducer({
  connection,
});

const transcodeQueue = new Queue<TranscodeData>("transcode", {
  connection,
});

const packageQueue = new Queue<PackageData>("package", {
  connection,
});

export const ffmpegQueue = new Queue<FfmpegData>("ffmpeg", {
  connection,
});

export const ffprobeQueue = new Queue<FfprobeData>("ffprobe", {
  connection,
});

/**
 * Export all available queues so we can read them elsewhere, such as in api
 * where we can build job stats for each queue.
 */
export const allQueus = [
  transcodeQueue,
  packageQueue,
  ffmpegQueue,
  ffprobeQueue,
];

type AddTranscodeJobData = {
  assetId?: string;
  inputs: PartialInput[];
  streams: PartialStream[];
  segmentSize?: number;
  packageAfter?: boolean;
  tag?: string;
};

/**
 * Add a transcode job to the queue.
 * When called multiple times with the same assetId, duplicate jobs will
 * be discarded.
 */
export async function addTranscodeJob({
  assetId = randomUUID(),
  inputs,
  streams,
  segmentSize = DEFAULT_SEGMENT_SIZE,
  packageAfter = false,
  tag,
}: AddTranscodeJobData) {
  return await transcodeQueue.add(
    "transcode",
    {
      assetId,
      inputs,
      streams,
      segmentSize,
      packageAfter,
      tag,
    },
    {
      jobId: `transcode_${assetId}`,
      removeOnComplete: {
        age: 3600 * 24 * 3,
        count: 200,
      },
      removeOnFail: {
        age: 3600 * 24 * 7,
      },
    },
  );
}

type AddPackageJobData = {
  assetId: string;
  defaultLanguage?: LangCode;
  defaultTextLanguage?: LangCode;
  segmentSize?: number;
  name?: string;
  tag?: string;
};

/**
 * Add a package job to the queue.
 */
export async function addPackageJob({
  assetId,
  defaultLanguage,
  defaultTextLanguage,
  segmentSize,
  name = "hls",
  tag,
}: AddPackageJobData) {
  return await packageQueue.add(
    "package",
    {
      assetId,
      defaultLanguage,
      defaultTextLanguage,
      segmentSize,
      name,
      tag,
    },
    {
      jobId: `package_${assetId}_${name}`,
      removeOnComplete: {
        age: 3600 * 24 * 3,
        count: 200,
      },
      removeOnFail: {
        age: 3600 * 24 * 7,
      },
    },
  );
}
