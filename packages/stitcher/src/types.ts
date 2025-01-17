import type { DateTime } from "luxon";

export interface Asset {
  url: string;
  duration: number;
}

export interface Vast {
  data?: string;
  url?: string;
  params?: Record<string, string>;
}

export interface TimedEvent {
  dateTime: DateTime;
  maxDuration?: number;
  assets?: Asset[];
  vast?: Vast;
  list?: {
    url: string;
  };
}
