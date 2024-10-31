import { runWorkers } from "bolt";
import { transcodeCallback } from "./transcode";
import { packageCallback } from "./package";
import { ffmpegCallback } from "./ffmpeg";
import { ffprobeCallback } from "./ffprobe";

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
