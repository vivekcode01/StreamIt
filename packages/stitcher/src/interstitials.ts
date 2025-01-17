import { DateTime } from "luxon";
import { createUrl, swapUrlParams } from "./lib/url";
import { getAssetsFromVastData, getAssetsFromVastUrl } from "./vast";
import type { DateRange } from "./parser";
import type { Session } from "./session";
import type { Asset } from "./types";

// An item describes what we'd like to collect for a particular date.
interface DateGroupItem {
  timelineStyle: "HIGHLIGHT" | "PRIMARY";
  listUrl?: string;
  maxDuration?: number;
}

export function getStaticDateRanges(session: Session, isLive: boolean) {
  const dateGroup = new Map<number, DateGroupItem>();

  for (const event of session.events) {
    const key = event.dateTime.toMillis();

    let item = dateGroup.get(key);
    if (!item) {
      item = {
        // Default values for each item, which will eventually resolve to an
        // interstitial later on.
        timelineStyle: "PRIMARY",
      };
      dateGroup.set(key, item);
    }

    if (event.vast) {
      // If we resolved the event by a vast, we know it's an ad and can mark it
      // as HIGHLIGHT on the timeline.
      item.timelineStyle = "HIGHLIGHT";
    }

    if (event.list) {
      item.listUrl = event.list.url;
    }

    if (
      event.maxDuration &&
      (item.maxDuration === undefined || event.maxDuration > item.maxDuration)
    ) {
      // If we have a max duration for this event, we'll save it for this interstitial. Always takes the
      // largest maxDuration across events.
      item.maxDuration = event.maxDuration;
    }
  }

  const dateList = [...dateGroup.entries()];

  return dateList.map<DateRange>(([key, item]) => {
    const startDate = DateTime.fromMillis(key);

    const assetListUrl =
      // If we have a listUrl from elsewhere, use it.
      item.listUrl ??
      // Construct our own listUrl.
      createUrl("out/asset-list.json", {
        dt: startDate.toISO(),
        sid: session?.id,
      });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      "CONTENT-MAY-VARY": "YES",
      "TIMELINE-OCCUPIES": "POINT",
      "TIMELINE-STYLE": item.timelineStyle,
    };

    if (!isLive) {
      clientAttributes["RESUME-OFFSET"] = 0;
    }

    if (item.maxDuration) {
      clientAttributes["PLAYOUT-LIMIT"] = item.maxDuration;
    }

    const cue: string[] = ["ONCE"];
    if (startDate.equals(session.startTime)) {
      cue.push("PRE");
    }

    if (cue.length) {
      clientAttributes["CUE"] = cue.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `${startDate.toMillis()}`,
      startDate,
      clientAttributes,
    };
  });
}

export async function getAssets(
  session: Session,
  dateTime: DateTime,
): Promise<Asset[]> {
  // Filter all events for a particular dateTime, we'll need to transform these to
  // a list of assets.
  const events = session.events.filter((event) =>
    event.dateTime.equals(dateTime),
  );

  const assets: Asset[] = [];

  for (const event of events) {
    if (event.vast?.url) {
      const vastUrl = swapUrlParams(event.vast.url);
      const tempAssets = await getAssetsFromVastUrl(vastUrl);
      assets.push(...tempAssets);
    }
    if (event.vast?.data) {
      const tempAssets = await getAssetsFromVastData(event.vast.data);
      assets.push(...tempAssets);
    }
    if (event.assets) {
      assets.push(...event.assets);
    }
    // TODO: We might resolve event.list here if there's multiple events, and one of them is list.
    // We currently don't support this and overwrite the asset-list url when list is set higher up.
  }

  // If we have a generic vast config on our session, use that one to resolve (eg; for live streams)
  if (session.vast?.url) {
    const vastUrl = swapUrlParams(session.vast.url);
    const tempAssets = await getAssetsFromVastUrl(vastUrl);
    assets.push(...tempAssets);
  }

  return assets;
}
