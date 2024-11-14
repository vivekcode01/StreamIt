import { DateTime } from "luxon";
import { assert } from "shared/assert";
import { filterMasterPlaylist } from "./filters";
import { getAssets, getStaticDateRanges } from "./interstitials";
import { buildProxyUrl, joinUrl, resolveUri } from "./lib/url";
import {
  groupRenditions,
  parseMasterPlaylist,
  parseMediaPlaylist,
  stringifyMasterPlaylist,
  stringifyMediaPlaylist,
} from "./parser";
import type { Filter } from "./filters";
import type { Session } from "./session";

export async function formatMasterPlaylist(
  url: string,
  session: Session,
  filter: Filter,
) {
  const master = await fetchMasterPlaylist(url);

  filterMasterPlaylist(master, filter);

  for (const variant of master.variants) {
    variant.uri = buildProxyUrl("playlist.m3u8", joinUrl(url, variant.uri), {
      session,
      params: {
        type: "video",
      },
    });
  }

  const renditions = groupRenditions(master.variants);
  renditions.forEach((rendition) => {
    let type: string | undefined;

    if (rendition.type === "AUDIO") {
      type = "audio";
    } else if (rendition.type === "SUBTITLES") {
      type = "text";
    } else {
      return;
    }

    rendition.uri = buildProxyUrl(
      "playlist.m3u8",
      joinUrl(url, rendition.uri),
      {
        session,
        params: {
          type,
        },
      },
    );
  });

  return stringifyMasterPlaylist(master);
}

export async function formatMediaPlaylist(
  session: Session,
  type: "video" | "audio" | "text",
  url: string,
) {
  assert(session.startTime, "No startTime in session");

  const media = await fetchMediaPlaylist(url);

  if (type === "video" && media.endlist && media.segments[0]) {
    // When we have an endlist, the playlist is static. We can check whether we need
    // to add dateRanges.

    media.segments[0].programDateTime = session.startTime;
    media.dateRanges = getStaticDateRanges(session);
  }

  media.segments.forEach((segment) => {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = joinUrl(url, segment.map.uri);
    }
    segment.uri = joinUrl(url, segment.uri);
  });

  return stringifyMediaPlaylist(media);
}

export async function formatAssetList(session: Session, startDate: string) {
  const lookupDate = DateTime.fromISO(startDate);
  const assets = await getAssets(session, lookupDate);
  return {
    ASSETS: assets,
  };
}

async function fetchMasterPlaylist(url: string) {
  const response = await fetch(url);
  const result = await response.text();
  return parseMasterPlaylist(result);
}

async function fetchMediaPlaylist(url: string) {
  const response = await fetch(url);
  const result = await response.text();
  return parseMediaPlaylist(result);
}

export async function fetchMasterPlaylistDuration(uri: string) {
  const url = resolveUri(uri);
  const variant = (await fetchMasterPlaylist(url))?.variants[0];

  if (!variant) {
    throw new Error(`Missing variant for "${url}"`);
  }

  const media = await fetchMediaPlaylist(joinUrl(url, variant.uri));
  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}
