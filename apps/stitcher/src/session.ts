import { DateTime } from "luxon";
import * as uuid from "uuid";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import { fetchDuration, pushTimedEvent } from "./playlist";
import type { AppContext } from "./app-context";
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

  timedEvents: TimedEvent[];
}

interface InterstitialInput {
  time: string | number;
  duration?: number;
  delay?: number;
  assets?: {
    uri: string;
  }[];
  vast?: {
    url: string;
  };
}

interface CreateSessionParams {
  uri: string;
  expiry: number;
  interstitials: InterstitialInput[];
  vmap?: {
    url: string;
  };
  vast?: {
    url?: string;
  };
}

export async function createSession(
  context: AppContext,
  params: CreateSessionParams,
) {
  const id = uuid.v4();
  const startTime = DateTime.now();
  const url = resolveUri(context, params.uri);

  const session: Session = {
    id,
    url,
    expiry: params.expiry,
    startTime,
    vmap: params.vmap,
    vast: params.vast,
    timedEvents: [],
  };

  if (params.interstitials) {
    for (const interstitial of params.interstitials) {
      const event = await mapInterstitialToTimedEvent(
        context,
        startTime,
        interstitial,
      );
      pushTimedEvent(session.timedEvents, event);
    }
  }

  const value = JSON.stringify(session);
  await context.kv.set(`session:${id}`, value, session.expiry);

  return session;
}

export async function getSession(context: AppContext, id: string) {
  const data = await context.kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return JSON.parse<Session>(data);
}

export async function updateSession(context: AppContext, session: Session) {
  const value = JSON.stringify(session);
  await context.kv.set(`session:${session.id}`, value, session.expiry);
}

export async function mapInterstitialToTimedEvent(
  context: AppContext,
  startTime: DateTime,
  interstitial: InterstitialInput,
): Promise<TimedEvent> {
  return {
    dateTime: toDateTime(startTime, interstitial.time),
    duration: interstitial.duration,
    delay: interstitial.delay,
    assets: interstitial.assets
      ? await Promise.all(
          interstitial.assets.map(async (asset) => {
            const url = resolveUri(context, asset.uri);
            return {
              url,
              duration: await fetchDuration(url),
            };
          }),
        )
      : undefined,
    vast: interstitial.vast,
  };
}

function toDateTime(startTime: DateTime, time: string | number) {
  return typeof time === "string"
    ? DateTime.fromISO(time)
    : startTime.plus({ seconds: time });
}
