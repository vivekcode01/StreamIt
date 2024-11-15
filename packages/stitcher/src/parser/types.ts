import type { DateTime } from "luxon";

export interface Resolution {
  width: number;
  height: number;
}

export type RenditionType = "AUDIO" | "SUBTITLES";

export interface Rendition {
  type: RenditionType;
  groupId: string;
  name: string;
  language?: string;
  uri: string;
  channels?: string;
}

export interface Variant {
  uri: string;
  bandwidth: number;
  codecs?: string;
  resolution?: Resolution;
  audio: Rendition[];
  subtitles: Rendition[];
}

export interface MasterPlaylist {
  independentSegments?: boolean;
  variants: Variant[];
}

export interface MediaInitializationSection {
  uri: string;
}

export interface Segment {
  uri: string;
  duration: number;
  discontinuity?: boolean;
  map?: MediaInitializationSection;
  programDateTime?: DateTime;
}

export type PlaylistType = "EVENT" | "VOD";

export interface MediaPlaylist {
  independentSegments?: boolean;
  targetDuration: number;
  endlist: boolean;
  playlistType?: PlaylistType;
  segments: Segment[];
  mediaSequenceBase?: number;
  discontinuitySequenceBase?: number;
  dateRanges: DateRange[];
}

export interface DateRange {
  id: string;
  classId: string;
  startDate: DateTime;
  clientAttributes?: Record<string, string | number>;
}
