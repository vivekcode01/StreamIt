import { DateTime } from "luxon";
import { assert } from "shared/assert";
import { env } from "./env";
import { resolveUri, toAssetProtocol } from "./lib/url";
import { fetchMasterPlaylistDuration } from "./playlist";
import { getAdMediasFromAdBreak } from "./vast";
import type { DateRange } from "./parser";
import type { Session } from "./session";
import type { VmapResponse } from "./vmap";

export type InterstitialType = "ad" | "bumper";

export interface Interstitial {
  timeOffset: number;
  url: string;
  type?: InterstitialType;
}

interface InterstitialAsset {
  URI: string;
  DURATION: number;
  "SPRS-TYPE"?: InterstitialType;
}

export function getStaticDateRanges(session: Session) {
  assert(session.startTime, "No startTime in session");

  const group: Record<string, InterstitialType[]> = {};

  if (session.vmapResponse) {
    for (const adBreak of session.vmapResponse.adBreaks) {
      const dateTime = session.startTime.plus({ seconds: adBreak.timeOffset });
      groupTimeOffset(group, dateTime, "ad");
    }
  }

  if (session.interstitials) {
    for (const interstitial of session.interstitials) {
      const dateTime = session.startTime.plus({
        seconds: interstitial.timeOffset,
      });
      groupTimeOffset(group, dateTime, interstitial.type);
    }
  }

  return Object.entries(group).map<DateRange>(([startDate, types], index) => {
    const assetListUrl = `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/asset-list.json?startDate=${encodeURIComponent(startDate)}`;

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
    };

    if (types.length) {
      clientAttributes["SPRS-TYPES"] = types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `i${index}`,
      startDate: DateTime.fromISO(startDate),
      clientAttributes,
    };
  });
}

function groupTimeOffset(
  group: Record<string, InterstitialType[]>,
  dateTime: DateTime,
  type?: InterstitialType,
) {
  const key = dateTime.toISO();
  if (!key) {
    return;
  }
  if (!group[key]) {
    group[key] = [];
  }
  if (type) {
    group[key].push(type);
  }
}

export async function getAssets(session: Session, lookupDate: DateTime) {
  assert(session.startTime, "No startTime in session");

  const assets: InterstitialAsset[] = [];

  if (session.vmapResponse) {
    await formatStaticAdBreaks(
      assets,
      session.vmapResponse,
      session.startTime,
      lookupDate,
    );
  }

  if (session.interstitials) {
    await formatStaticInterstitials(
      assets,
      session.interstitials,
      session.startTime,
      lookupDate,
    );
  }

  return assets;
}

async function formatStaticAdBreaks(
  assets: InterstitialAsset[],
  vmapResponse: VmapResponse,
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const adBreak = vmapResponse.adBreaks.find((adBreak) =>
    isEqualTimeOffset(baseDate, adBreak.timeOffset, lookupDate),
  );

  if (!adBreak) {
    // No adbreak found for the time offset. There's nothing left to do.
    return;
  }

  const adMedias = await getAdMediasFromAdBreak(adBreak);

  for (const adMedia of adMedias) {
    const uri = toAssetProtocol(adMedia.assetId);
    assets.push({
      URI: resolveUri(uri),
      DURATION: adMedia.duration,
      "SPRS-TYPE": "ad",
    });
  }
}

async function formatStaticInterstitials(
  assets: InterstitialAsset[],
  interstitials: Interstitial[],
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  // Filter each interstitial and match it with the given lookup time.
  const list = interstitials.filter((interstitial) =>
    isEqualTimeOffset(baseDate, interstitial.timeOffset, lookupDate),
  );

  for (const interstitial of list) {
    const duration = await fetchMasterPlaylistDuration(interstitial.url);
    assets.push({
      URI: interstitial.url,
      DURATION: duration,
      "SPRS-TYPE": interstitial.type,
    });
  }
}

function isEqualTimeOffset(
  baseDate: DateTime,
  timeOffset: number,
  lookupDate: DateTime,
) {
  return baseDate.plus({ seconds: timeOffset }).toISO() === lookupDate.toISO();
}
