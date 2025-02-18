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
  const timedEvents = [...session.timedEvents];

  // Check if segments have event info (such as splice info) and push them
  // to the list of events.
  const segmentTimedEvents = getTimedEventsFromSegments(segments);
  segmentTimedEvents.forEach((event) => pushTimedEvent(timedEvents, event));

  return timedEvents.map((timedEvent) => {
    const assetListUrl = createUrl(context, "out/asset-list.json", {
      dt: timedEvent.dateTime.toISO(),
      sid: session.id,
      mdur: timedEvent.duration,
    });

    // TODO: THIS IS LIVE 2 VOD

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      "CONTENT-MAY-VARY": "YES",
      "TIMELINE-STYLE": "HIGHLIGHT",
      "TIMELINE-OCCUPIES": timedEvent.duration ? "POINT" : "POINT",
    };

    if (!isLive) {
      clientAttributes["RESUME-OFFSET"] = timedEvent.duration ?? 0;
    }

    if (timedEvent.duration) {
      clientAttributes["PLAYOUT-LIMIT"] = timedEvent.duration;
      clientAttributes["INLINE-DURATION"] = timedEvent.duration;
    }

    const cue: string[] = [];
    if (timedEvent.dateTime.equals(session.startTime)) {
      cue.push("ONCE", "PRE");
    }

    if (cue.length) {
      clientAttributes["CUE"] = cue.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `sprs.${timedEvent.dateTime.toMillis()}`,
      startDate: timedEvent.dateTime,
      duration: timedEvent.duration,
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
  const timedEvent = session.timedEvents.find((e) =>
    e.dateTime.equals(dateTime),
  );

  const assets: Asset[] = [];

  if (timedEvent) {
    if (timedEvent.vast) {
      const vastAssets = await getAssetsFromVastParams(
        context,
        timedEvent.vast,
        {
          maxDuration,
        },
      );
      assets.push(...vastAssets);
    }

    if (timedEvent.assets) {
      assets.push(...timedEvent.assets);
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
