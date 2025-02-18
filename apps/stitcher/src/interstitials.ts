import { createUrl } from "./lib/url";
import { pushTimedEvent } from "./playlist";
import { getAssetsFromVastParams } from "./vast";
import type { AppContext } from "./app-context";
import type { DateRange, Segment } from "./parser";
import type { Session } from "./session";
import type { Asset, TimedEvent } from "./types";
import type { DateTime } from "luxon";

export function getStaticDateRanges(
  context: AppContext,
  session: Session,
  segments: Segment[],
  isLive: boolean,
): DateRange[] {
  // Grab a copy of the events in the session, we might add events from
  // elsewhere later on.
  const timedEvents = [...session.events];

  // Check if segments have event info (such as splice info) and push them
  // to the list of events.
  const segmentTimedEvents = getTimedEventsFromSegments(segments);
  segmentTimedEvents.forEach((event) => pushTimedEvent(timedEvents, event));

  return timedEvents.map((event) => {
    const assetListUrl = createUrl(context, "out/asset-list.json", {
      dt: event.dateTime.toISO(),
      sid: session.id,
      mdur: event.duration,
    });

    const show = !!event.assets.find((asset) => asset.vast);

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      "CONTENT-MAY-VARY": "YES",
      "TIMELINE-STYLE": show ? "HIGHLIGHT" : "PRIMARY",
      "TIMELINE-OCCUPIES": event.duration ? "RANGE" : "POINT",
    };

    let duration: number | undefined;

    if (!isLive) {
      clientAttributes["RESUME-OFFSET"] = event.duration ?? 0;
      duration = event.duration;
    }

    if (event.duration) {
      clientAttributes["PLAYOUT-LIMIT"] = event.duration;
    }

    const cue: string[] = [];
    if (event.dateTime.equals(session.startTime)) {
      cue.push("ONCE", "PRE");
    }

    if (cue.length) {
      clientAttributes["CUE"] = cue.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `sprs.${event.dateTime.toMillis()}`,
      startDate: event.dateTime,
      duration,
      clientAttributes,
    };
  });
}

function getTimedEventsFromSegments(segments: Segment[]) {
  const events: TimedEvent[] = [];

  for (const segment of segments) {
    if (segment.spliceInfo?.type !== "OUT" || !segment.programDateTime) {
      continue;
    }

    events.push({
      dateTime: segment.programDateTime,
      duration: segment.spliceInfo.duration,
      assets: [],
    });
  }

  return events;
}

export async function getAssets(
  context: AppContext,
  session: Session,
  dateTime: DateTime,
  maxDuration?: number,
): Promise<Asset[]> {
  const event = session.events.find((event) => event.dateTime.equals(dateTime));

  const assets: Asset[] = [];

  if (event) {
    for (const assetResolver of event.assets) {
      if (assetResolver.asset) {
        assets.push(assetResolver.asset);
      }

      if (assetResolver.vast) {
        const vastAssets = await getAssetsFromVastParams(
          context,
          assetResolver.vast,
          {
            maxDuration,
          },
        );
        assets.push(...vastAssets);
      }
    }
  }

  // If we have a generic vast config on our session, use that one to resolve (eg; for live streams)
  if (session.vast) {
    const tempAssets = await getAssetsFromVastParams(context, session.vast, {
      maxDuration,
    });
    assets.push(...tempAssets);
  }

  return assets;
}
