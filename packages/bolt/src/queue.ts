import { Queue } from "bullmq";
import { connection } from "./env";
import type { LangCode } from "shared/typebox";
import type { Stream, Input, PartialInput, PartialStream } from "./types";

export type TranscodeData = {
  assetId: string;
  inputs: PartialInput[];
  streams: PartialStream[];
  segmentSize: number;
  packageAfter?: boolean;
  group?: string;
};

export const transcodeQueue = new Queue<TranscodeData>("transcode", {
  connection,
});

export type PackageData = {
  assetId: string;
  language?: LangCode;
  segmentSize?: number;
  name: string;
};

export const packageQueue = new Queue<PackageData>("package", {
  connection,
});

export type FfmpegData = {
  input: Input;
  stream: Stream;
  segmentSize: number;
  assetId: string;
  parentSortIndex: number;
};

export const ffmpegQueue = new Queue<FfmpegData>("ffmpeg", {
  connection,
});

export type FfprobeData = {
  inputs: PartialInput[];
  parentSortIndex: number;
};

export const ffprobeQueue = new Queue<FfprobeData>("ffprobe", {
  connection,
});

export type OutcomeData =
  | {
      type: "transcode";
      data: TranscodeData;
    }
  | {
      type: "package";
      data: PackageData;
    };

export const outcomeQueue = new Queue<OutcomeData>("outcome", {
  connection,
});
