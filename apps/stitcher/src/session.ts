import { DateTime } from "luxon";
import * as uuid from "uuid";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import { fetchDuration } from "./playlist";
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

  events: TimedEvent[];
}

type InterstitialInput = {
  time: string | number;
  duration?: number;
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

interface CreateSessionParams {
  uri: string;
  expiry: number;
  vmap?: {
    url: string;
  };
  vast?: {
    url?: string;
  };
  interstitials?: InterstitialInput[];
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
    events: [],
  };

  if (params.interstitials) {
    const events = await Promise.all(
      params.interstitials.map((interstitial) =>
        mapInterstitialToTimedEvent(context, startTime, interstitial),
      ),
    );
    session.events.push(...events);
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
  const dateTime = toDateTime(startTime, interstitial.time);

  const event: TimedEvent = {
    dateTime,
    duration: interstitial.duration,
  };

  if (interstitial.type === "asset") {
    const url = resolveUri(context, interstitial.uri);
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

function toDateTime(startTime: DateTime, time: string | number) {
  return typeof time === "string"
    ? DateTime.fromISO(time)
    : startTime.plus({ seconds: time });
}
