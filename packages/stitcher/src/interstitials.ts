import { DateTime } from "luxon";
import { Group } from "./lib/group";
import { makeUrl } from "./lib/url";
import { fetchDuration } from "./playlist";
import { getAdMediasFromAdBreak } from "./vast";
import { toAdBreakTimeOffset } from "./vmap";
import type { DateRange } from "./parser";
import type { Session } from "./session";
import type { AdMedia } from "./vast";
import type { VmapResponse } from "./vmap";

export type InterstitialType = "ad" | "bumper";

export interface Interstitial {
  timeOffset: number;
  url: string;
  duration?: number;
  type?: InterstitialType;
}

interface InterstitialAsset {
  URI: string;
  DURATION: number;
  "SPRS-TYPE"?: InterstitialType;
}

export function getStaticDateRanges(session: Session) {
  const group = new Group<number, InterstitialType>();

  if (session.vmapResponse) {
    for (const adBreak of session.vmapResponse.adBreaks) {
      const timeOffset = toAdBreakTimeOffset(adBreak);
      if (timeOffset !== null) {
        const unixTime = session.startTime
          .plus({
            seconds: timeOffset,
          })
          .toMillis();
        group.add(unixTime, "ad");
      }
    }
  }

  if (session.interstitials) {
    for (const interstitial of session.interstitials) {
      const unixTime = session.startTime
        .plus({
          seconds: interstitial.timeOffset,
        })
        .toMillis();
      group.add(unixTime, interstitial.type);
    }
  }

  return group.map<DateRange>((unixTime, types) => {
    const dateTime = DateTime.fromMillis(unixTime);

    const assetListUrl = makeAssetListUrl({
      dateTime,
      session,
    });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
      CUE: "ONCE",
    };

    if (dateTime.equals(session.startTime)) {
      clientAttributes["CUE"] += ",PRE";
    }

    if (types.length) {
      clientAttributes["SPRS-TYPES"] = types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `${dateTime.toUnixInteger()}`,
      startDate: dateTime,
      clientAttributes,
    };
  });
}

export async function getAssets(session: Session, dateTime: DateTime) {
  const timeOffset = dateTime.diff(session.startTime, "seconds").seconds;

  const assets: InterstitialAsset[] = [];

  if (session.vmapResponse) {
    const items = await getAssetsFromVmap(session.vmapResponse, timeOffset);
    assets.push(...items);
  }

  if (session.interstitials) {
    const items = await getAssetsFromGroup(session.interstitials, timeOffset);
    assets.push(...items);
  }

  return assets;
}

async function getAssetsFromVmap(vmap: VmapResponse, timeOffset: number) {
  const adBreaks = vmap.adBreaks.filter(
    (adBreak) => toAdBreakTimeOffset(adBreak) === timeOffset,
  );

  const assets: InterstitialAsset[] = [];

  const adMedias: AdMedia[] = [];
  for (const adBreak of adBreaks) {
    const list = await getAdMediasFromAdBreak(adBreak);
    adMedias.push(...list);
  }

  for (const adMedia of adMedias) {
    assets.push({
      URI: adMedia.masterUrl,
      DURATION: adMedia.duration,
      "SPRS-TYPE": "ad",
    });
  }

  return assets;
}

async function getAssetsFromGroup(
  interstitials: Interstitial[],
  timeOffset: number,
) {
  const assets: InterstitialAsset[] = [];

  for (const interstitial of interstitials) {
    if (interstitial.timeOffset !== timeOffset) {
      continue;
    }

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

function makeAssetListUrl(params: { dateTime: DateTime; session?: Session }) {
  return makeUrl("out/asset-list.json", {
    dt: params.dateTime.toISO(),
    sid: params.session?.id,
  });
}
