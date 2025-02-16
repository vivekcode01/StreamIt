import { DateTime } from "luxon";
import * as uuid from "uuid";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import { fetchDuration } from "./playlist";
import type { Globals } from "./middleware/globals";
import type { Kv } from "./middleware/kv";
import type { TimedEvent } from "./types";

export interface Session {
  id: string;
  url: string;
  expiry: number;

  startTime: DateTime;

  vmap?: {
    url: string;
    // TODO: This is currently an object, but we might want to keep VMAP specific info
    // later, which we can do here.
    result?: object;
  };
  vast?: {
    url?: string;
  };

  events: TimedEvent[];
}

type InterstitialInput = {
  time: string | number;
} & (
  | {
      type: "asset";
      uri: string;
    }
  | {
      type: "vast";
      url: string;
    }
);

interface RegionInput {
  time: string | number;
  inlineDuration?: number;
}

export async function createSession(
  params: {
    uri: string;
    expiry: number;
    vmap?: {
      url: string;
    };
    vast?: {
      url?: string;
    };
    interstitials?: InterstitialInput[];
    regions?: RegionInput[];
  },
  context: {
    globals: Globals;
    kv: Kv;
  },
) {
  const id = uuid.v4();
  const startTime = DateTime.now();
  const url = resolveUri(params.uri, context);

  const session: Session = {
    id,
    url,
    expiry: params.expiry,
    startTime,
    vmap: params.vmap,
    vast: params.vast,
    events: [],
  };

  if (params.interstitials) {
    const events = await Promise.all(
      params.interstitials.map((interstitial) =>
        mapInterstitialToTimedEvent(startTime, interstitial, context),
      ),
    );
    session.events.push(...events);
  }

  if (params.regions) {
    const events = params.regions.map((region) =>
      mapRegionToTimedEvent(startTime, region),
    );
    session.events.push(...events);
  }

  const value = JSON.stringify(session);
  await context.kv.set(`session:${id}`, value, session.expiry);

  return session;
}

export async function getSession(id: string, kv: Kv) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return JSON.parse<Session>(data);
}

export async function updateSession(session: Session, kv: Kv) {
  const value = JSON.stringify(session);
  await kv.set(`session:${session.id}`, value, session.expiry);
}

export async function mapInterstitialToTimedEvent(
  startTime: DateTime,
  interstitial: InterstitialInput,
  context: {
    globals: Globals;
  },
): Promise<TimedEvent> {
  const dateTime = toDateTime(startTime, interstitial.time);

  const event: TimedEvent = {
    dateTime,
  };

  if (interstitial.type === "asset") {
    const url = resolveUri(interstitial.uri, context);
    event.asset = {
      url,
      duration: await fetchDuration(url),
    };
  }

  if (interstitial.type === "vast") {
    event.vast = {
      url: interstitial.url,
    };
  }

  return event;
}

export function mapRegionToTimedEvent(
  startTime: DateTime,
  region: RegionInput,
): TimedEvent {
  const dateTime = toDateTime(startTime, region.time);

  return {
    dateTime,
    inlineDuration: region.inlineDuration,
  };
}

function toDateTime(startTime: DateTime, time: string | number) {
  return typeof time === "string"
    ? DateTime.fromISO(time)
    : startTime.plus({ seconds: time });
}
