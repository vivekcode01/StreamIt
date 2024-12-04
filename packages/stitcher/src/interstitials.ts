import { makeUrl } from "./lib/url";
import { fetchDuration } from "./playlist";
import { getAdMediasFromVast } from "./vast";
import type { Session } from "./session";
import type { Interstitial, InterstitialAssetType } from "./types";
import type { DateTime } from "luxon";

export function getStaticDateRanges(session: Session, isLive: boolean) {
  const group: {
    dateTime: DateTime;
    types: InterstitialAssetType[];
  }[] = [];

  for (const interstitial of session.interstitials) {
    let item = group.find((item) =>
      item.dateTime.equals(interstitial.dateTime),
    );

    if (!item) {
      item = {
        dateTime: interstitial.dateTime,
        types: [],
      };
      group.push(item);
    }

    const type = getInterstitialType(interstitial);
    if (type && !item.types.includes(type)) {
      item.types.push(type);
    }
  }

  return group.map((item) => {
    const assetListUrl = makeAssetListUrl({
      dateTime: item.dateTime,
      session,
    });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      CUE: "ONCE",
    };

    const isPreroll = item.dateTime.equals(session.startTime);

    if (!isLive || isPreroll) {
      clientAttributes["RESUME-OFFSET"] = 0;
    }

    if (isPreroll) {
      clientAttributes["CUE"] += ",PRE";
    }

    if (item.types.length) {
      clientAttributes["SPRS-TYPES"] = item.types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `${item.dateTime.toUnixInteger()}`,
      startDate: item.dateTime,
      clientAttributes,
    };
  });
}

export async function getAssets(session: Session, dateTime: DateTime) {
  const assets: {
    URI: string;
    DURATION: number;
    "SPRS-TYPE"?: InterstitialAssetType;
  }[] = [];

  const interstitials = session.interstitials.filter((interstitial) =>
    interstitial.dateTime.equals(dateTime),
  );

  for (const interstitial of interstitials) {
    const adMedias = await getAdMediasFromVast(interstitial);
    for (const adMedia of adMedias) {
      assets.push({
        URI: adMedia.masterUrl,
        DURATION: adMedia.duration,
        "SPRS-TYPE": "ad",
      });
    }

    if (interstitial.asset) {
      assets.push({
        URI: interstitial.asset.url,
        DURATION: await fetchDuration(interstitial.asset.url),
        "SPRS-TYPE": interstitial.asset.type,
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

function getInterstitialType(
  interstitial: Interstitial,
): InterstitialAssetType | undefined {
  if (interstitial.vastData || interstitial.vastUrl) {
    return "ad";
  }
  return interstitial.asset?.type;
}
