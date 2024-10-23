import { FFmpeggy } from "ffmpeggy";
import { uploadFile } from "../s3";
import { getBinaryPath, getInput } from "../helpers";
import type { WorkerCallback } from "../lib/worker-processor";
import type { Stream, Input } from "../../types";

const ffmpegBin = await getBinaryPath("ffmpeg");

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffmpegBin,
};

export type FfmpegData = {
  input: Input;
  stream: Stream;
  segmentSize: number;
  assetId: string;
  parentSortIndex: number;
};

export type FfmpegResult = {
  name: string;
  stream: Stream;
};

export const ffmpegCallback: WorkerCallback<FfmpegData, FfmpegResult> = async ({
  job,
  tmpDir,
}) => {
  const outDir = await tmpDir.create();

  const inputFile = await getInput(tmpDir, job.data.input);

  job.log(`Input is ${inputFile.path}`);

  const ffmpeg = new FFmpeggy({
    input: inputFile.path,
    globalOptions: ["-loglevel error"],
  });

  let name: string | undefined;
  const outputOptions: string[] = [];

  const { stream } = job.data;

  if (stream.type === "video") {
    name = `video_${stream.height}_${stream.bitrate}_${stream.codec}.m4v`;
    outputOptions.push(...getVideoOutputOptions(stream, job.data.segmentSize));
  }

  if (stream.type === "audio") {
    name = `audio_${stream.language}_${stream.bitrate}_${stream.codec}.m4a`;
    outputOptions.push(...getAudioOutputOptions(stream, job.data.segmentSize));
  }

  if (stream.type === "text") {
    name = `text_${stream.language}.vtt`;
    outputOptions.push(...getTextOutputOptions());
  }

  if (!name) {
    throw new Error(
      "Missing name, this is most likely a bug. Report it, please.",
    );
  }

  ffmpeg.setOutput(`${outDir}/${name}`);
  ffmpeg.setOutputOptions(outputOptions);

  job.log(`Transcode to ${name}`);

  ffmpeg.on("start", (args) => {
    job.log(args.join(" "));
  });

  ffmpeg.on("progress", (event) => {
    job.updateProgress(event.percent ?? 0);
  });

  ffmpeg.run();

  await ffmpeg.done();

  job.updateProgress(100);

  job.log(
    `Uploading ${outDir}/${name} to transcode/${job.data.assetId}/${name}`,
  );

  await uploadFile(
    `transcode/${job.data.assetId}/${name}`,
    `${outDir}/${name}`,
  );

  return {
    name,
    stream: job.data.stream,
  };
};

function getVideoOutputOptions(
  stream: Extract<Stream, { type: "video" }>,
  segmentSize: number,
) {
  const keyFrameRate = segmentSize * stream.framerate;

  const args: string[] = [
    "-f mp4",
    "-an",
    `-c:v ${stream.codec}`,
    `-b:v ${stream.bitrate}`,
    `-r ${stream.framerate}`,
    "-movflags +frag_keyframe",
    `-frag_duration ${segmentSize * 1_000_000}`,
    `-keyint_min ${keyFrameRate}`,
    `-g ${keyFrameRate}`,
  ];

  if (stream.codec === "h264") {
    let profile = "main";
    if (stream.height >= 720) {
      profile = "high";
    }
    args.push(`-profile:v ${profile}`);
  }

  if (stream.codec === "h264" || stream.codec === "hevc") {
    args.push(
      "-preset slow",
      "-flags +loop",
      "-pix_fmt yuv420p",
      "-flags +cgop",
    );
  }

  const filters: string[] = ["setsar=1:1", `scale=-2:${stream.height}`];

  if (filters.length) {
    args.push(`-vf ${filters.join(",")}`);
  }

  return args;
}

function getAudioOutputOptions(
  stream: Extract<Stream, { type: "audio" }>,
  segmentSize: number,
) {
  const args: string[] = [
    "-f mp4",
    "-vn",
    `-ac ${stream.channels}`,
    `-c:a ${stream.codec}`,
    `-b:a ${stream.bitrate}`,
    `-frag_duration ${segmentSize * 1_000_000}`,
    `-metadata language=${stream.language}`,
    "-strict experimental",
  ];

  const filters: string[] = [];
  if (stream.channels === 6) {
    filters.push("channelmap=channel_layout=5.1");
  }

  if (filters.length) {
    args.push(`-af ${filters.join(",")}`);
  }

  return args;
}

function getTextOutputOptions() {
  const args: string[] = ["-f webvtt"];
  return args;
}
