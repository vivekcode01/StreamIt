import { Worker } from "bullmq";
import { connection } from "../env";
import { transcodeCallback } from "./transcode";
import { packageCallback } from "./package";
import { ffmpegCallback } from "./ffmpeg";
import { ffprobeCallback } from "./ffprobe";
import { createWorkerProcessor } from "../lib/worker-processor";

const transcodeProcessor = createWorkerProcessor(transcodeCallback);
const packageProcessor = createWorkerProcessor(packageCallback);
const ffmpegProcessor = createWorkerProcessor(ffmpegCallback);
const ffprobeProcessor = createWorkerProcessor(ffprobeCallback);

const workers = [
  new Worker("transcode", transcodeProcessor, {
    connection,
    autorun: false,
  }),
  new Worker("package", packageProcessor, {
    connection,
    autorun: false,
  }),
  new Worker("ffmpeg", ffmpegProcessor, {
    connection,
    autorun: false,
  }),
  new Worker("ffprobe", ffprobeProcessor, {
    connection,
    autorun: false,
  }),
];

async function gracefulShutdown() {
  for (const worker of workers) {
    if (!worker.isRunning()) {
      continue;
    }
    await worker.close();
  }
  process.exit(0);
}

process
  .on("beforeExit", gracefulShutdown)
  .on("SIGINT", gracefulShutdown)
  .on("SIGTERM", gracefulShutdown);

export async function startWorkers() {
  workers.forEach((worker) => {
    worker.run();
    console.log(`Started worker "${worker.name}"`);
  });
}
