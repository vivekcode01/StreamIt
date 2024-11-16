import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./kv";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
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
  const value = JSON.stringify(session);
  await kv.set(`session:${id}`, value, 60 * 10);

  return session;
}

export async function getSession(id: string) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return JSON.parse<Session>(data);
}

export async function processSessionOnMasterReq(session: Session) {
  // Check if we have a startTime, if so, the master playlist has been requested
  // before and we no longer need it.
  if (session.startTime) {
    return;
  }

  session.startTime = DateTime.now();

  if (session.vmap) {
    const USER_AGENT =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
    const response = await fetch(session.vmap.url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
    session.vmapResponse = await response.text();
    delete session.vmap;
  }

  const value = JSON.stringify(session);
  await kv.set(`session:${session.id}`, value, session.expiry);
}
