import { DateTime } from "luxon";
import { createUrl, replaceUrlParams } from "./lib/url";
import { getAssetsFromVastData, getAssetsFromVastUrl } from "./vast";
import type { Api } from "./middleware/api";
import type { Globals } from "./middleware/globals";
import type { DateRange, Segment } from "./parser";
import type { Session } from "./session";
import type { Asset, TimedEvent } from "./types";

interface Group {
  showTimeline: boolean;
  inlineDuration?: number;
}

export function getStaticDateRanges(
  context: {
    globals: Globals;
  },
  session: Session,
  segments: Segment[],
) {
  const groups = new Map<number, Group>();

  for (const event of session.events) {
    groupEvent(groups, event);
  }

  const derivedEvents = getTimedEventsFromSegments(segments);

  for (const event of derivedEvents) {
    groupEvent(groups, event);
  }

  const dateRanges: DateRange[] = [];

  Array.from(groups.entries()).forEach(([ts, group]) => {
    const dateTime = DateTime.fromMillis(ts);

    const assetListUrl = createUrl(context, "out/asset-list.json", {
      dt: dateTime.toISO(),
      sid: session.id,
      mdur: group.inlineDuration,
    });

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "ASSET-LIST": assetListUrl,
      "CONTENT-MAY-VARY": "YES",
      "TIMELINE-STYLE": group.showTimeline ? "HIGHLIGHT" : "PRIMARY",
      "TIMELINE-OCCUPIES": group.inlineDuration ? "RANGE" : "POINT",
      "RESUME-OFFSET": group.inlineDuration ?? 0,
    };

    const cue: string[] = [];
    if (dateTime.equals(session.startTime)) {
      cue.push("PRE");
    }

    if (cue.length) {
      clientAttributes["CUE"] = cue.join(",");
    }

    dateRanges.push({
      classId: "com.apple.hls.interstitial",
      id: `sprs.${dateTime.toMillis()}`,
      startDate: dateTime,
      duration: group.inlineDuration,
      clientAttributes,
    });
  });

  return dateRanges;
}

function groupEvent(groups: Map<number, Group>, event: TimedEvent) {
  const ts = event.dateTime.toMillis();

  let group = groups.get(ts);
  if (!group) {
    group = {
      showTimeline: false,
    };
    groups.set(ts, group);
  }

  if (event.inlineDuration) {
    group.inlineDuration = event.inlineDuration;
  }

  if (event.vast) {
    group.showTimeline = true;
  }
}

function getTimedEventsFromSegments(segments: Segment[]) {
  const events: TimedEvent[] = [];

  for (const segment of segments) {
    if (segment.spliceInfo?.type !== "OUT" || !segment.programDateTime) {
      continue;
    }

    events.push({
      dateTime: segment.programDateTime,
      inlineDuration: segment.spliceInfo.duration,
    });
  }

  return events;
}

export async function getAssets(
  context: {
    globals: Globals;
    api?: Api;
  },
  session: Session,
  dateTime: DateTime,
  maxDuration?: number,
): Promise<Asset[]> {
  // Filter all events for a particular dateTime, we'll need to transform these to
  // a list of assets.
  const events = session.events.filter((event) =>
    event.dateTime.equals(dateTime),
  );

  const assets: Asset[] = [];

  for (const event of events) {
    if (event.vast) {
      const { url, data } = event.vast;

      // The event contains a VAST url.
      if (url) {
        const vastUrl = replaceUrlParams(url, {
          maxDuration,
        });
        const vastAssets = await getAssetsFromVastUrl(context, vastUrl);
        assets.push(...vastAssets);
      }

      // The event contains inline VAST data.
      if (data) {
        const vastAssets = await getAssetsFromVastData(context, data);
        assets.push(...vastAssets);
      }
    }

    // The event contains a list of assets, explicitly defined.
    if (event.asset) {
      assets.push(event.asset);
    }
  }

  // If we have a generic vast config on our session, use that one to resolve (eg; for live streams)
  if (session.vast?.url) {
    const vastUrl = replaceUrlParams(session.vast.url, {
      maxDuration,
    });
    const tempAssets = await getAssetsFromVastUrl(context, vastUrl);
    assets.push(...tempAssets);
  }

  return assets;
}
