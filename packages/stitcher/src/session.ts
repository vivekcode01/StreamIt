import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./adapters/kv";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import { fetchDuration } from "./playlist";
import type { TimedEvent, Vast } from "./types";

export interface SessionVmap {
  url: string;
}

export interface Session {
  id: string;
  url: string;
  expiry: number;

  startTime: DateTime;

  vmap?: SessionVmap;
  vast?: Vast;
  events: TimedEvent[];
}

interface InterstitialParam {
  time: string | number;
  maxDuration?: number;
  assets?: {
    uri: string;
  }[];
  vast?: {
    url?: string;
    params?: Record<string, string>;
  };
  list?: {
    url: string;
  };
}

export async function createSession(params: {
  uri: string;
  vmap?: {
    url: string;
  };
  vast?: {
    url: string;
    params?: Record<string, string>;
  };
  interstitials?: InterstitialParam[];
  expiry?: number;
}) {
  const id = randomUUID();
  const startTime = DateTime.now();
  const url = resolveUri(params.uri);

  const session: Session = {
    id,
    url,
    // A session is valid for 3 hours by default.
    expiry: params.expiry ?? 60 * 60 * 3,

    startTime,

    vmap: params.vmap,
    vast: params.vast,
    events: [],
  };

  if (params.interstitials) {
    const events = await Promise.all(
      params.interstitials.map((interstitial) =>
        mapInterstitialToTimedEvent(startTime, interstitial),
      ),
    );
    session.events.push(...events);
  }

  const value = JSON.stringify(session);
  await kv.set(`session:${id}`, value, session.expiry);

  return session;
}

export async function getSession(id: string) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return JSON.parse<Session>(data);
}

export async function updateSession(session: Session) {
  const value = JSON.stringify(session);
  await kv.set(`session:${session.id}`, value, session.expiry);
}

export async function mapInterstitialToTimedEvent(
  startTime: DateTime,
  interstitial: InterstitialParam,
) {
  const dateTime =
    typeof interstitial.time === "string"
      ? DateTime.fromISO(interstitial.time)
      : startTime.plus({ seconds: interstitial.time });

  const event: TimedEvent = {
    dateTime,
    maxDuration: interstitial.maxDuration,
  };

  if (interstitial.assets) {
    event.assets = await Promise.all(
      interstitial.assets.map(async (asset) => {
        const url = resolveUri(asset.uri);
        return {
          url,
          duration: await fetchDuration(url),
        };
      }),
    );
  }

  if (interstitial.vast) {
    event.vast = interstitial.vast;
  }

  if (interstitial.list) {
    event.list = interstitial.list;
  }

  return event;
}
