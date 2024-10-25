import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./kv";
import type { VmapResponse } from "./vmap";

const DEFAULT_SESSION_EXPIRY = 3600;

export type Session = {
  id: string;
  uri: string;
  dt: DateTime;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  vmapResponse?: VmapResponse;
  expiry: number;
};

export type SessionInterstitialType = "ad" | "bumper";

export type SessionInterstitial = {
  timeOffset: number;
  uri: string;
  type?: SessionInterstitialType;
};

export type SessionFilter = {
  resolution?: string;
};

export type SessionVmap = {
  url: string;
};

export async function createSession(data: {
  uri: string;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  expiry?: number;
}) {
  const sessionId = randomUUID();

  const session: Session = {
    id: sessionId,
    uri: data.uri,
    filter: data.filter,
    interstitials: data.interstitials,
    vmap: data.vmap,
    dt: DateTime.now(),
    expiry: data.expiry ?? DEFAULT_SESSION_EXPIRY,
  };

  await kv.set(`sessions:${sessionId}`, toSerializable(session), 60 * 15);

  return session;
}

export async function getSession(sessionId: string) {
  const data = await kv.get(`sessions:${sessionId}`);
  if (!data) {
    throw new Error(`No session found with id "${sessionId}".`);
  }
  return parseFromJson(data);
}

export async function updateSession(session: Session) {
  const ttl = 60 * 60 * 6; // 6 hours
  await kv.set(`session:${session.id}`, toSerializable(session), ttl);
}

function toSerializable(session: Session) {
  return JSON.stringify({
    ...session,
    dt: session.dt.toISO(),
  });
}

function parseFromJson(text: string): Session {
  const obj = JSON.parse(text);
  return {
    ...obj,
    dt: DateTime.fromISO(obj.dt),
  };
}
