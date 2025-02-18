import type { Level, MediaPlaylist } from "hls.js";

export type Playhead = "idle" | "play" | "playing" | "pause" | "ended";

export enum Events {
  RESET = "reset",
  READY = "ready",
  STARTED = "started",
  PLAYHEAD_CHANGE = "playheadChange",
  TIME_CHANGE = "timeChange",
  VOLUME_CHANGE = "volumeChange",
  QUALITIES_CHANGE = "qualitiesChange",
  AUDIO_TRACKS_CHANGE = "audioTracksChange",
  SUBTITLE_TRACKS_CHANGE = "subtitleTracksChange",
  AUTO_QUALITY_CHANGE = "autoQualityChange",
  SEEKING_CHANGE = "seekingChange",
  TIMELINE_CHANGE = "timelineChange",
}

export type HlsPlayerEventMap = {
  [Events.RESET]: () => void;
  [Events.READY]: () => void;
  [Events.STARTED]: () => void;
  [Events.PLAYHEAD_CHANGE]: () => void;
  [Events.TIME_CHANGE]: () => void;
  [Events.VOLUME_CHANGE]: () => void;
  [Events.QUALITIES_CHANGE]: () => void;
  [Events.AUDIO_TRACKS_CHANGE]: () => void;
  [Events.SUBTITLE_TRACKS_CHANGE]: () => void;
  [Events.AUTO_QUALITY_CHANGE]: () => void;
  [Events.SEEKING_CHANGE]: () => void;
  [Events.TIMELINE_CHANGE]: () => void;
} & {
  "*": (event: Events) => void;
};

export interface Quality {
  height: number;
  active: boolean;
  levels: Level[];
}

export interface AudioTrack {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
}

export interface SubtitleTrack {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
}

export interface TimelineItem {
  start: number;
  duration: number;
  inlineDuration?: number;
}
