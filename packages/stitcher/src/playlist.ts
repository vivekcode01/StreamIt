import { DateTime } from "luxon";
import { filterMaster } from "./filters";
import { getAssets, getStaticDateRanges, getStaticPDT } from "./interstitials";
import { stringifyMasterPlaylist, stringifyMediaPlaylist } from "./parser";
import { Presentation } from "./presentation";
import type { Session } from "./session";

export async function formatMasterPlaylist(session: Session) {
  const presentation = new Presentation(session.uri);

  const master = await presentation.getMaster();

  if (session.filter) {
    filterMaster(master, session.filter);
  }

  if (!master.variants.length) {
    throw new Error("Playlist has no variants.");
  }

  return stringifyMasterPlaylist(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const presentation = new Presentation(session.uri);

  const { mediaType, media } = await presentation.getMedia(path);

  if (mediaType === "video" && media.endlist && media.segments[0]) {
    // When we have an endlist, the playlist is static. We can check whether we need
    // to add dateRanges.
    media.segments[0].programDateTime = getStaticPDT(session);
    media.dateRanges = getStaticDateRanges(session);
  }

  return stringifyMediaPlaylist(media);
}

export async function formatAssetList(session: Session, startDate: string) {
  const lookupDate = DateTime.fromISO(startDate);
  const assets = await getAssets(session, lookupDate);
  return { ASSETS: assets };
}
