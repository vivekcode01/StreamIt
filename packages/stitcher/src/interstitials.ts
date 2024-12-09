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

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      "CONTENT-MAY-VARY": "YES",
      "TIMELINE-OCCUPIES": "POINT",
      "TIMELINE-STYLE": getTimelineStyle(interstitials),
    };

    if (!isLive) {
      clientAttributes["RESUME-OFFSET"] = 0;
    }

    const cue: string[] = ["ONCE"];
    if (startDate.equals(session.startTime)) {
      cue.push("PRE");
    }

    if (cue.length) {
      clientAttributes["CUE"] = cue.join(",");
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

function getTimelineStyle(interstitials: Interstitial[]) {
  for (const interstitial of interstitials) {
    if (
      // If interstitial is an ad.
      interstitial.asset?.kind === "ad" ||
      // If interstitial is a VAST, thus it contains ads.
      interstitial.vast
    ) {
      return "HIGHLIGHT";
    }
  }
  return "PRIMARY";
}
