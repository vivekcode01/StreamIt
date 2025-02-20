import Hls from "hls.js";

export { HlsPlayer } from "./hls-player";
export { Events } from "./types";

export type {
  Playhead,
  HlsPlayerEventMap,
  Quality,
  AudioTrack,
  SubtitleTrack,
} from "./types";

export const HLSJS_VERSION = Hls.version;
