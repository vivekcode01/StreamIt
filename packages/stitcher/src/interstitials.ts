import { makeUrl } from "./lib/url";
import { fetchDuration } from "./playlist";
import { getAdMediasFromVastData } from "./vast";
import type { Session } from "./session";
import type { DateTime } from "luxon";

export type InterstitialType = "ad" | "bumper";

export interface Interstitial {
  dateTime: DateTime;
  vastData: InterstitialVastData[];
  assets: InterstitialAsset[];
}

export type InterstitialVastData =
  | {
      type: "url";
      url: string;
    }
  | {
      type: "data";
      data: string;
    };

export interface InterstitialAsset {
  url: string;
  type?: InterstitialType;
}

interface ResultAsset {
  URI: string;
  DURATION: number;
  "SPRS-TYPE"?: InterstitialType;
}

export function getStaticDateRanges(session: Session) {
  if (!session.interstitials) {
    return [];
  }

  return session.interstitials.map((interstitial) => {
    const types = interstitial.assets?.map((asset) => asset.type) ?? [];

    if (interstitial.vastData && !types.includes("ad")) {
      types.push("ad");
    }

    const assetListUrl = makeAssetListUrl({
      dateTime: interstitial.dateTime,
      session,
    });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
      CUE: "ONCE",
    };

    if (interstitial.dateTime.equals(session.startTime)) {
      clientAttributes["CUE"] += ",PRE";
    }

    if (types.length) {
      clientAttributes["SPRS-TYPES"] = types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `${interstitial.dateTime.toUnixInteger()}`,
      startDate: interstitial.dateTime,
      clientAttributes,
    };
  });
}

export async function getAssets(session: Session, dateTime: DateTime) {
  const assets: ResultAsset[] = [];

  const interstitial = session.interstitials?.find((interstitial) =>
    interstitial.dateTime.equals(dateTime),
  );

  if (!interstitial) {
    return [];
  }

  if (interstitial.vastData) {
    const adMedias = await getAdMediasFromVastData(interstitial.vastData);
    for (const adMedia of adMedias) {
      assets.push({
        URI: adMedia.masterUrl,
        DURATION: adMedia.duration,
        "SPRS-TYPE": "ad",
      });
    }
  }

  if (interstitial.assets) {
    for (const asset of interstitial.assets) {
      assets.push({
        URI: asset.url,
        DURATION: await fetchDuration(asset.url),
        "SPRS-TYPE": asset.type,
      });
    }
  }

  return assets;
}

function makeAssetListUrl(params: { dateTime: DateTime; session?: Session }) {
  return makeUrl("out/asset-list.json", {
    dt: params.dateTime.toISO(),
    sid: params.session?.id,
  });
}
