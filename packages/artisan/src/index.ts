import { runWorkers } from "bolt";
import { transcodeCallback } from "./workers/transcode";
import { packageCallback } from "./workers/package";
import { ffmpegCallback } from "./workers/ffmpeg";
import { ffprobeCallback } from "./workers/ffprobe";

runWorkers([
  {
    name: "transcode",
    callback: transcodeCallback,
  },
  {
    name: "package",
    callback: packageCallback,
  },
  {
    name: "ffmpeg",
    callback: ffmpegCallback,
  },
  {
    name: "ffprobe",
    callback: ffprobeCallback,
  },
]);
