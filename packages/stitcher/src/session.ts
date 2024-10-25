import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./kv";
import { fetchVmap } from "./vmap";
import type { VmapResponse } from "./vmap";

export type Starter = {
  uri: string;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  expiry?: number;
};

export type Session = {
  id: string;
  initialTime: DateTime;
  vmap?: VmapResponse;
} & Pick<Starter, "uri" | "interstitials" | "filter">;

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

export async function createStarter(data: {
  uri: string;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  expiry?: number;
}) {
  const id = randomUUID();

  const starter: Starter = {
    uri: data.uri,
    filter: data.filter,
    interstitials: data.interstitials,
    vmap: data.vmap,
    expiry: data.expiry,
  };

  await kv.set(`starter:${id}`, JSON.stringify(starter), 60 * 15);

  return id;
}

export async function getStarter(id: string): Promise<Starter> {
  const data = await kv.get(`starter:${id}`);
  if (!data) {
    throw new Error(`Invalid starter for id "${id}"`);
  }
  return JSON.parse(data);
}

export async function swapStarterForSession(id: string, starter: Starter) {
  const session: Session = {
    id,
    initialTime: DateTime.now(),
    uri: starter.uri,
    interstitials: starter.interstitials,
    filter: starter.filter,
  };

  if (starter.vmap) {
    session.vmap = await fetchVmap(starter.vmap.url);
  }

  const serializableSession = {
    ...session,
    id: undefined,
    initialTime: session.initialTime.toISO(),
  };

  const ttl = starter.expiry ?? 3600;
  await kv.set(`session:${id}`, JSON.stringify(serializableSession), ttl);

  return session;
}

export async function getSession(id: string) {
  const data = await kv.get(`session:${id}`);
  if (!data) {
    return null;
  }

  const fields = JSON.parse(data);

  return {
    ...fields,
    id,
    initialTime: DateTime.fromISO(fields.initialTime),
  } as Session;
}
