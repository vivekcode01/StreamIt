import type { Stream } from "./types";

export type FfmpegResult = {
  name: string;
  stream: Stream;
};

export type FfprobeResult = {
  video: Record<
    string,
    {
      height?: number;
      framerate?: number;
    }
  >;
  audio: Record<
    string,
    {
      language?: string;
      channels?: number;
    }
  >;
};

export type TranscodeResult = {
  assetId: string;
};

export type PackageResult = {
  assetId: string;
};
