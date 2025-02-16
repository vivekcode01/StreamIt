import { DateTime } from "luxon";
import * as uuid from "uuid";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import { fetchDuration } from "./playlist";
import { getRedisKey, setRedisKeyValue } from "./redis";
import type { TimedEvent } from "./types";
import type { Context } from "hono";

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
  publicS3Endpoint: string,
  context: Context,
) {
  const id = uuid.v4();
  const startTime = DateTime.now();
  const url = resolveUri(params.uri, publicS3Endpoint);

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
        mapInterstitialToTimedEvent(startTime, interstitial, publicS3Endpoint),
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
  await setRedisKeyValue(context, `session:${id}`, value, session.expiry);

  return session;
}

export async function getSession(context: Context, id: string) {
  const data = await getRedisKey(context, `session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return JSON.parse<Session>(data);
}

export async function updateSession(context: Context, session: Session) {
  const value = JSON.stringify(session);
  await setRedisKeyValue(
    context,
    `session:${session.id}`,
    value,
    session.expiry,
  );
}

export async function mapInterstitialToTimedEvent(
  startTime: DateTime,
  interstitial: InterstitialInput,
  publicS3Endpoint: string,
): Promise<TimedEvent> {
  const dateTime = toDateTime(startTime, interstitial.time);

  const event: TimedEvent = {
    dateTime,
  };

  if (interstitial.type === "asset") {
    const url = resolveUri(interstitial.uri, publicS3Endpoint);
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
