import { AudioCodec, VideoCodec } from "bolt";

const DEFAULT_AUDIO_BITRATE: Record<number, Record<AudioCodec, number>> = {
  2: {
    [AudioCodec.aac]: 128000,
    [AudioCodec.ac3]: 192000,
    [AudioCodec.eac3]: 96000,
  },
  6: {
    [AudioCodec.aac]: 256000,
    [AudioCodec.ac3]: 384000,
    [AudioCodec.eac3]: 192000,
  },
};

export function getDefaultAudioBitrate(channels: number, codec: AudioCodec) {
  return DEFAULT_AUDIO_BITRATE[channels]?.[codec] ?? null;
}

const DEFAULT_VIDEO_BITRATE: Record<number, Record<VideoCodec, number>> = {
  144: {
    [VideoCodec.h264]: 108000,
    [VideoCodec.hevc]: 96000,
    [VideoCodec.vp9]: 96000,
  },
  240: {
    [VideoCodec.h264]: 242000,
    [VideoCodec.hevc]: 151000,
    [VideoCodec.vp9]: 151000,
  },
  360: {
    [VideoCodec.h264]: 400000,
    [VideoCodec.hevc]: 277000,
    [VideoCodec.vp9]: 277000,
  },
  480: {
    [VideoCodec.h264]: 1000000,
    [VideoCodec.hevc]: 512000,
    [VideoCodec.vp9]: 512000,
  },
  720: {
    [VideoCodec.h264]: 2000000,
    [VideoCodec.hevc]: 1000000,
    [VideoCodec.vp9]: 1000000,
  },
  1080: {
    [VideoCodec.h264]: 4000000,
    [VideoCodec.hevc]: 2000000,
    [VideoCodec.vp9]: 2000000,
  },
  1440: {
    [VideoCodec.h264]: 9000000,
    [VideoCodec.hevc]: 6000000,
    [VideoCodec.vp9]: 6000000,
  },
  2160: {
    [VideoCodec.h264]: 17000000,
    [VideoCodec.hevc]: 12000000,
    [VideoCodec.vp9]: 12000000,
  },
};

export function getDefaultVideoBitrate(height: number, codec: VideoCodec) {
  return DEFAULT_VIDEO_BITRATE[height]?.[codec] ?? null;
}
