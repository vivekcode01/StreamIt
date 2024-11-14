import { DateTime } from "luxon";
import { filterMaster } from "./filters";
import { getAssets, getStaticDateRanges, getStaticPDT } from "./interstitials";
import { getDir, getMasterUrl, joinPath } from "./lib/url";
import {
  groupRenditions,
  parseMasterPlaylist,
  parseMediaPlaylist,
  stringifyMasterPlaylist,
  stringifyMediaPlaylist,
} from "./parser";
import type { Session } from "./session";

export async function formatMasterPlaylist(session: Session) {
  const url = getMasterUrl(session.uri);
  const master = await fetchMasterPlaylist(url);

  if (session.filter) {
    filterMaster(master, session.filter);
  }

  if (!master.variants.length) {
    throw new Error("Playlist has no variants.");
  }

  for (const variant of master.variants) {
    variant.uri = `playlist.m3u8?type=video&path=${encodeURIComponent(createFullUrl(url, variant.uri))}`;
  }

  groupRenditions(master.variants).forEach((rendition) => {
    const type = {
      AUDIO: "audio",
      SUBTITLES: "text",
    }[rendition.type];
    rendition.uri = `playlist.m3u8?type=${type}&path=${encodeURIComponent(createFullUrl(url, rendition.uri))}`;
  });

  return stringifyMasterPlaylist(master);
}

export async function formatMediaPlaylist(
  session: Session,
  type: "video" | "audio" | "text",
  path: string,
) {
  const media = await fetchMediaPlaylist(path);

  if (type === "video" && media.endlist && media.segments[0]) {
    // When we have an endlist, the playlist is static. We can check whether we need
    // to add dateRanges.
    media.segments[0].programDateTime = getStaticPDT(session);
    media.dateRanges = getStaticDateRanges(session);
  }

  media.segments.forEach((segment) => {
    if (
      segment.uri.startsWith("http://") ||
      segment.uri.startsWith("https://")
    ) {
      return;
    }
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = createFullUrl(path, segment.map.uri);
    }
    segment.uri = createFullUrl(path, segment.uri);
  });

  return stringifyMediaPlaylist(media);
}

export async function formatAssetList(session: Session, startDate: string) {
  const lookupDate = DateTime.fromISO(startDate);
  const assets = await getAssets(session, lookupDate);
  return { ASSETS: assets };
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

export async function getPlaylistDuration(uri: string) {
  const masterUrl = getMasterUrl(uri);
  const master = await fetchMasterPlaylist(masterUrl);

  const firstVariant = master.variants[0];
  if (!firstVariant) {
    throw new Error("No first variant found");
  }

  const mediaUrl = createFullUrl(masterUrl, firstVariant.uri);
  const media = await fetchMediaPlaylist(mediaUrl);

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}

function createFullUrl(masterUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const dir = getDir(masterUrl);
  return joinPath(dir, path);
}
