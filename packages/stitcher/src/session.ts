import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./kv";
import { resolveUri } from "./lib/url";
import { fetchVmap } from "./vmap";
import type { Interstitial, InterstitialType } from "./interstitials";
import type { VmapResponse } from "./vmap";

export interface Session {
  id: string;
  initTime: DateTime;
  vmap?: {
    url: string;
  };
  vmapResponse?: VmapResponse;
  interstitials?: Interstitial[];
}

export async function createSession(params: {
  vmap?: {
    url: string;
  };
  interstitials?: {
    timeOffset: number;
    uri: string;
    type?: InterstitialType;
  }[];
}) {
  const id = randomUUID();

  const initTime = DateTime.now();
  const session: Session = {
    id,
    initTime,
    vmap: params.vmap,
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

  const ttl = 3600;
  await kv.set(`session:${id}`, serializeSession(session), ttl);

  return id;
}

export async function getSession(id: string) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    throw new Error(`No session found for id ${id}`);
  }
  return deserializeSession(id, data);
}

export async function formatSessionByMasterRequest(
  id: string,
  session: Session,
) {
  let updateSession = false;

  if (session.vmap) {
    session.vmapResponse = await fetchVmap(session.vmap.url);
    delete session.vmap;

    updateSession = true;
  }

  if (updateSession) {
    const ttl = 3600;
    await kv.set(`session:${id}`, serializeSession(session), ttl);
  }
}

function serializeSession(session: Session) {
  const copy = {
    ...session,
    id: undefined,
    initTime: session.initTime.toISO(),
  };
  return JSON.stringify(copy);
}

function deserializeSession(id: string, value: string): Session {
  const copy = JSON.parse(value);
  const session = {
    ...copy,
    id,
    initTime: DateTime.fromISO(copy.initTime),
  };
  return session;
}
