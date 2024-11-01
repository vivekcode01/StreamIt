import { runWorkers } from "bolt";
import { ffmpegCallback } from "./ffmpeg";
import { ffprobeCallback } from "./ffprobe";
import { packageCallback } from "./package";
import { transcodeCallback } from "./transcode";

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
