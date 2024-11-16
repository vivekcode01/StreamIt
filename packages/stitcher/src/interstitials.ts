import { assert } from "shared/assert";
import { Group } from "./lib/group";
import { makeUrl, resolveUri } from "./lib/url";
import { fetchDuration } from "./playlist";
import { getAdMediasFromAdBreak } from "./vast";
import { parseVmap } from "./vmap";
import type { DateRange } from "./parser";
import type { Session } from "./session";
import type { VmapResponse } from "./vmap";
import type { DateTime } from "luxon";

export type InterstitialType = "ad" | "bumper";

export interface Interstitial {
  url: string;
  duration?: number;
  type?: InterstitialType;
}

interface InterstitialAsset {
  URI: string;
  DURATION: number;
  "SPRS-TYPE"?: InterstitialType;
}

export function getStaticDateRanges(startTime: DateTime, session: Session) {
  const group = new Group<number, InterstitialType | undefined>();

  if (session.vmapResponse) {
    const vmap = parseVmap(session.vmapResponse);
    for (const adBreak of vmap.adBreaks) {
      group.add(adBreak.timeOffset, "ad");
    }
  }

  session.interstitials?.forEach((timeOffset, interstitials) => {
    interstitials.forEach((interstitial) => {
      group.add(timeOffset, interstitial.type);
    });
  });

  const dateRanges: DateRange[] = [];

  group.forEach((timeOffset, types) => {
    const startDate = startTime.plus({ seconds: timeOffset });

    const assetListUrl = makeUrl(`session/${session.id}/asset-list.json`, {
      startDate: startDate.toISO(),
    });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
    };

    if (types.length) {
      clientAttributes["SPRS-TYPES"] = types.join(",");
    }

    dateRanges.push({
      classId: "com.apple.hls.interstitial",
      id: `sdr${timeOffset}`,
      startDate,
      clientAttributes,
    });
  });

  return dateRanges;
}

export async function getAssets(session: Session, lookupDate: DateTime) {
  const assets: InterstitialAsset[] = [];

  if (session.startTime) {
    if (session.vmapResponse) {
      const vmap = parseVmap(session.vmapResponse);
      const vmapAssets = await getAssetsFromVmap(
        vmap,
        session.startTime,
        lookupDate,
      );
      assets.push(...vmapAssets);
    }

    if (session.interstitials) {
      const groupAssets = await getAssetsFromGroup(
        session.interstitials,
        session.startTime,
        lookupDate,
      );
      assets.push(...groupAssets);
    }
  }

  return assets;
}

async function getAssetsFromVmap(
  vmap: VmapResponse,
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const timeOffset = getTimeOffset(baseDate, lookupDate);
  const adBreak = vmap.adBreaks.find(
    (adBreak) => adBreak.timeOffset === timeOffset,
  );

  if (!adBreak) {
    // No adbreak found for the time offset. There's nothing left to do.
    return [];
  }

  const assets: InterstitialAsset[] = [];

  const adMedias = await getAdMediasFromAdBreak(adBreak);

  for (const adMedia of adMedias) {
    assets.push({
      URI: resolveUri(`asset://${adMedia.assetId}`),
      DURATION: adMedia.duration,
      "SPRS-TYPE": "ad",
    });
  }

  return assets;
}

async function getAssetsFromGroup(
  interstitialsGroup: Group<number, Interstitial>,
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const assets: InterstitialAsset[] = [];

  const timeOffset = getTimeOffset(baseDate, lookupDate);

  const interstitials = interstitialsGroup.get(timeOffset);

  for (const interstitial of interstitials) {
    let duration = interstitial.duration;
    if (!duration) {
      duration = await fetchDuration(interstitial.url);
    }

    assets.push({
      URI: interstitial.url,
      DURATION: duration,
      "SPRS-TYPE": interstitial.type,
    });
  }

  return assets;
}

function getTimeOffset(baseDate: DateTime, lookupDate: DateTime) {
  const { seconds } = lookupDate.diff(baseDate, "seconds").toObject();
  assert(seconds);
  return seconds;
}
