import type { LangCode, VideoCodec, AudioCodec } from "shared/typebox";

export type PartialStream =
  | {
      type: "video";
      codec: VideoCodec;
      height: number;
      bitrate?: number;
      framerate?: number;
    }
  | {
      type: "audio";
      codec: AudioCodec;
      bitrate?: number;
      language?: LangCode;
      channels?: number;
    }
  | {
      type: "text";
      language: LangCode;
    };

export type Stream = Required<PartialStream>;

export type PartialInput =
  | {
      type: "video";
      path: string;
      height?: number;
      framerate?: number;
    }
  | {
      type: "audio";
      path: string;
      language?: LangCode;
      channels?: number;
    }
  | {
      type: "text";
      path: string;
      language: LangCode;
    };

export type Input = Required<PartialInput>;

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
export type FfprobeData = {
  inputs: PartialInput[];
  parentSortIndex: number;
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

export type TranscodeData = {
  assetId: string;
  inputs: PartialInput[];
  streams: PartialStream[];
  segmentSize: number;
  packageAfter?: boolean;
  tag?: string;
};

export type TranscodeResult = {
  assetId: string;
};

export type PackageData = {
  assetId: string;
  defaultLanguage?: LangCode;
  defaultTextLanguage?: LangCode;
  segmentSize?: number;
  name: string;
  tag?: string;
};

export type PackageResult = {
  assetId: string;
};
