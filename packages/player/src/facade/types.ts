import type {
  HlsAssetPlayer,
  InterstitialAssetItem,
  Level,
  MediaPlaylist,
} from "hls.js";

/**
 * A custom type for each `ASSET`.
 */
export type CustomInterstitialType = "ad" | "bumper";

/**
 * Defines an in-band subtitle track.
 */
export interface SubtitleTrack {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
}

/**
 * Defines an audio track.
 */
export interface AudioTrack {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
}

/**
 * Defines a quality level.
 */
export interface Quality {
  height: number;
  active: boolean;
  levels: Level[];
}

/**
 * State of playhead across all assets.
 */
export type Playhead = "idle" | "play" | "playing" | "pause" | "ended";

/**
 * Defines an interstitial, which is not the primary content.
 */
export interface Interstitial {
  time: number;
  duration: number;
  player: HlsAssetPlayer;
  asset: InterstitialAssetItem;
  type?: CustomInterstitialType;
}

/**
 * State variables.
 */
export interface State {
  playhead: Playhead;
  started: boolean;
  time: number;
  duration: number;
  volume: number;
  autoQuality: boolean;
  qualities: Quality[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
}

/**
 * List of events.
 */
export enum Events {
  RESET = "reset",
  READY = "ready",
  PLAYHEAD_CHANGE = "playheadChange",
  TIME_CHANGE = "timeChange",
  VOLUME_CHANGE = "volumeChange",
  QUALITIES_CHANGE = "qualitiesChange",
  AUDIO_TRACKS_CHANGE = "audioTracksChange",
  SUBTITLE_TRACKS_CHANGE = "subtitleTracksChange",
  AUTO_QUALITY_CHANGE = "autoQualityChange",
  INTERSTITIAL_CHANGE = "interstitialChange",
}

export interface PlayheadChangeEventData {
  playhead: Playhead;
  started: boolean;
}

export interface TimeChangeEventData {
  time: number;
  duration: number;
}

export interface VolumeChangeEventData {
  volume: number;
}

export interface QualitiesChangeEventData {
  qualities: Quality[];
}

export interface AudioTracksChangeEventData {
  audioTracks: AudioTrack[];
}

export interface SubtitleTracksChangeEventData {
  subtitleTracks: SubtitleTrack[];
}

export interface AutoQualityChangeEventData {
  autoQuality: boolean;
}

export interface InterstitialChangeEventData {
  interstitial: Interstitial | null;
}

/**
 * List of events with their respective event handlers.
 */
export interface HlsFacadeListeners {
  "*": () => void;
  [Events.RESET]: () => void;
  [Events.READY]: () => void;
  [Events.PLAYHEAD_CHANGE]: (data: PlayheadChangeEventData) => void;
  [Events.TIME_CHANGE]: (data: TimeChangeEventData) => void;
  [Events.VOLUME_CHANGE]: (data: VolumeChangeEventData) => void;
  [Events.QUALITIES_CHANGE]: (data: QualitiesChangeEventData) => void;
  [Events.AUDIO_TRACKS_CHANGE]: (data: AudioTracksChangeEventData) => void;
  [Events.SUBTITLE_TRACKS_CHANGE]: (
    data: SubtitleTracksChangeEventData,
  ) => void;
  [Events.AUTO_QUALITY_CHANGE]: (data: AutoQualityChangeEventData) => void;
  [Events.INTERSTITIAL_CHANGE]: (data: InterstitialChangeEventData) => void;
}
