export enum AudioCodec {
  aac = "aac",
  ac3 = "ac3",
  eac3 = "eac3",
}

export enum VideoCodec {
  h264 = "h264",
  vp9 = "vp9",
  hevc = "hevc",
}

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
      language?: string;
      channels?: number;
    }
  | {
      type: "text";
      language: string;
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
      language?: string;
      channels?: number;
    }
  | {
      type: "text";
      path: string;
      language: string;
    };

export type Input = Required<PartialInput>;
