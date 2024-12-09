import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { kv } from "./adapters/kv";
import { JSON } from "./lib/json";
import { resolveUri } from "./lib/url";
import type { Interstitial } from "./types";
import type { VmapParams } from "./vmap";

export interface Session {
  id: string;
  url: string;
  expiry: number;
  startTime: DateTime;

  // User defined options
  vmap?: VmapParams;
  interstitials: Interstitial[];
}

type SessionInterstitial = {
  time: number | string;
} & (
  | {
      type: "asset";
      uri: string;
      kind?: "ad" | "bumper";
    }
  | { type: "vast"; url: string }
  | { type: "assetList"; url: string }
);

export async function createSession(params: {
  uri: string;
  vmap?: VmapParams;
  interstitials?: SessionInterstitial[];
  expiry?: number;
}) {
  const id = randomUUID();
  const startTime = DateTime.now();

  const session: Session = {
    id,
    url: resolveUri(params.uri),
    vmap: params.vmap,
    startTime,
    interstitials: [],
    // A session is valid for 3 hours by default.
    expiry: params.expiry ?? 60 * 60 * 3,
  };

  if (params.interstitials) {
    session.interstitials = mapSessionInterstitials(
      startTime,
      params.interstitials,
    );
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

export async function updateSession(session: Session) {
  const value = JSON.stringify(session);
  await kv.set(`session:${session.id}`, value, session.expiry);
}

function mapSessionInterstitials(
  startTime: DateTime,
  interstitials: SessionInterstitial[],
): Interstitial[] {
  return interstitials.reduce<Interstitial[]>((acc, item) => {
    const dateTime =
      typeof item.time === "string"
        ? DateTime.fromISO(item.time)
        : startTime.plus({ seconds: item.time });

    if (item.type === "asset") {
      acc.push({
        dateTime,
        asset: {
          url: resolveUri(item.uri),
          kind: item.kind,
        },
      });
    } else if (item.type === "vast") {
      acc.push({
        dateTime,
        vast: { url: item.url },
      });
    } else if (item.type === "assetList") {
      acc.push({
        dateTime,
        assetList: { url: item.url },
      });
    }

    return acc;
  }, []);
}
