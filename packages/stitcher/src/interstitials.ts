import { DateTime } from "luxon";
import { createUrl } from "./lib/url";
import { getAssetsFromVast } from "./vast";
import type { DateRange } from "./parser";
import type { Session } from "./session";
import type { Interstitial, InterstitialAsset } from "./types";

export function getStaticDateRanges(session: Session, isLive: boolean) {
  const group = getGroupedInterstitials(session.interstitials);

  const dateRanges: DateRange[] = [];

  for (const [ts, interstitials] of group.entries()) {
    const startDate = DateTime.fromMillis(ts);

    const assetListUrl = getAssetListUrl(startDate, interstitials, session);
    const kinds = getInterstitialsKinds(interstitials);

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      CUE: "ONCE",
    };

    if (!isLive) {
      clientAttributes["RESUME-OFFSET"] = 0;
    }

    const atStart = startDate.equals(session.startTime);
    if (atStart) {
      clientAttributes["CUE"] += ",PRE";
    }

    if (kinds.length) {
      clientAttributes["SPRS-INCLUDES-KIND"] = kinds.join(",");
    }

    dateRanges.push({
      classId: "com.apple.hls.interstitial",
      id: `${ts}`,
      startDate,
      clientAttributes,
    });
  }

  return dateRanges;
}

export async function getAssets(session: Session, dateTime: DateTime) {
  const assets: InterstitialAsset[] = [];

  const interstitials = session.interstitials.filter((interstitial) =>
    interstitial.dateTime.equals(dateTime),
  );

  for (const interstitial of interstitials) {
    if (interstitial.vast) {
      const nextAssets = await getAssetsFromVast(interstitial.vast);
      assets.push(...nextAssets);
    }

    if (interstitial.asset) {
      assets.push(interstitial.asset);
    }
  }

  return assets;
}

function getGroupedInterstitials(interstitials: Interstitial[]) {
  const result = new Map<number, Interstitial[]>();

  for (const interstitial of interstitials) {
    const ts = interstitial.dateTime.toMillis();
    let items = result.get(ts);
    if (!items) {
      items = [];
      result.set(ts, items);
    }
    items.push(interstitial);
  }

  return result;
}

function getAssetListUrl(
  dateTime: DateTime,
  interstitials: Interstitial[],
  session?: Session,
) {
  if (interstitials.length === 1 && interstitials[0]?.assetList) {
    return interstitials[0].assetList.url;
  }

  return createUrl("out/asset-list.json", {
    dt: dateTime.toISO(),
    sid: session?.id,
  });
}

function getInterstitialsKinds(interstitials: Interstitial[]) {
  return interstitials
    .map((interstitial) => {
      if (interstitial.asset?.kind) {
        return interstitial.asset.kind;
      }
      if (interstitial.vast) {
        return "ad";
      }
      return null;
    })
    .filter((kind) => kind !== null);
}
