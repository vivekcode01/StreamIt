import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./kv";
import { resolveUri } from "./lib/url";
import { fetchVmap } from "./vmap";
import type { Interstitial, InterstitialType } from "./interstitials";

export interface Session {
  id: string;
  url: string;
  startTime?: DateTime;
  expiry: number;
  vmap?: {
    url: string;
  };
  vmapResponse?: string;
  interstitials?: Interstitial[];
}

export async function createSession(params: {
  uri: string;
  vmap?: {
    url: string;
  };
  interstitials?: {
    timeOffset: number;
    uri: string;
    type?: InterstitialType;
  }[];
  expiry?: number;
}) {
  const id = randomUUID();

  const session: Session = {
    id,
    url: resolveUri(params.uri),
    vmap: params.vmap,
    // A session is valid for 3 hours by default.
    expiry: params.expiry ?? 60 * 60 * 3,
  };

  if (params.interstitials?.length) {
    session.interstitials = params.interstitials.map((interstitial) => {
      return {
        timeOffset: interstitial.timeOffset,
        url: resolveUri(interstitial.uri),
        type: interstitial.type,
      };
    });
  }

  // We'll initially store the session for 10 minutes, if it's not been consumed
  // within the timeframe, it's gone.
  await kv.set(`session:${id}`, serializeSession(session), 60 * 10);

  return session;
}

export async function getSession(id: string) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return deserializeSession(id, data);
}

export async function formatSessionByMasterRequest(session: Session) {
  // Check if we have a startTime, if so, the master playlist has been requested
  // before and we no longer need it.
  if (session.startTime) {
    return;
  }

  session.startTime = DateTime.now();

  if (session.vmap) {
    session.vmapResponse = await fetchVmap(session.vmap.url);
    delete session.vmap;
  }

  await kv.set(
    `session:${session.id}`,
    serializeSession(session),
    session.expiry,
  );
}

function serializeSession(session: Session) {
  const copy = {
    ...session,
    id: undefined,
    startTime: session.startTime?.toISO(),
  };
  return JSON.stringify(copy);
}

function deserializeSession(id: string, value: string): Session {
  const copy = JSON.parse(value);
  const session = {
    ...copy,
    id,
    startTime: copy.startTime ? DateTime.fromISO(copy.startTime) : undefined,
  };
  return session;
}
