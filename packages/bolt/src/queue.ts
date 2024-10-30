import { Queue } from "bullmq";
import { connection } from "./env";
import type {
  TranscodeData,
  PackageData,
  FfmpegData,
  FfprobeData,
} from "./types";

export const transcodeQueue = new Queue<TranscodeData>("transcode", {
  connection,
});

export const packageQueue = new Queue<PackageData>("package", {
  connection,
});

export const ffmpegQueue = new Queue<FfmpegData>("ffmpeg", {
  connection,
});

export const ffprobeQueue = new Queue<FfprobeData>("ffprobe", {
  connection,
});
