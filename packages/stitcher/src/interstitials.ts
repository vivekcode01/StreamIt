import { DateTime } from "luxon";
import { env } from "./env";
import { getAdMediasFromVast, type AdMedia } from "./vast";
import { Presentation } from "./presentation";
import type { VmapResponse } from "./vmap";
import type { DateRange } from "./parser";
import type {
  Session,
  SessionInterstitialType,
  SessionInterstitial,
} from "./session";

type InterstitialAsset = {
  URI: string;
  DURATION: number;
  "SPRS-TYPE": Required<SessionInterstitial["type"]>;
};

export function getStaticPDT(session: Session) {
  return session.initialTime;
}

export function getStaticDateRanges(session: Session) {
  const group: Record<string, SessionInterstitialType[]> = {};

  if (session.vmap) {
    for (const adBreak of session.vmap.adBreaks) {
      groupTimeOffset(group, session.initialTime, adBreak.timeOffset, "ad");
    }
  }

  if (session.interstitials) {
    for (const interstitial of session.interstitials) {
      groupTimeOffset(
        group,
        session.initialTime,
        interstitial.timeOffset,
        interstitial.type,
      );
    }
  }

  return Object.entries(group).map<DateRange>(([startDate, types], index) => {
    const assetListUrl = `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/asset-list.json?startDate=${encodeURIComponent(startDate)}`;

    const clientAttributes: Record<string, number | string> = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
    };

    if (types.length) {
      clientAttributes["SPRS-TYPES"] = types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `i${index}`,
      startDate: DateTime.fromISO(startDate),
      clientAttributes,
    };
  });
}

function groupTimeOffset(
  group: Record<string, SessionInterstitialType[]>,
  startDate: DateTime,
  timeOffset: number,
  type?: SessionInterstitialType,
) {
  const key = startDate.plus({ seconds: timeOffset }).toISO();
  if (!key) {
    return;
  }
  if (!group[key]) {
    group[key] = [];
  }
  if (type) {
    group[key].push(type);
  }
}

export async function getAssets(session: Session, lookupDate: DateTime) {
  const assets: InterstitialAsset[] = [];

  if (session.vmap) {
    await formatAdBreaks(assets, session.vmap, session.initialTime, lookupDate);
  }

  if (session.interstitials) {
    await formatInterstitials(
      assets,
      session.interstitials,
      session.initialTime,
      lookupDate,
    );
  }

  return assets;
}

async function formatAdBreaks(
  assets: InterstitialAsset[],
  vmapResponse: VmapResponse,
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const adBreaks = vmapResponse.adBreaks.filter((adBreak) =>
    isEqualTimeOffset(baseDate, adBreak.timeOffset, lookupDate),
  );

  if (!adBreaks.length) {
    return;
  }

  const adMedias: AdMedia[] = [];

  for (const adBreak of adBreaks) {
    const items = await getAdMediasFromVast(adBreak);
    adMedias.push(...items);
  }

  for (const adMedia of adMedias) {
    const presentation = new Presentation(`asset://${adMedia.assetId}`);
    assets.push({
      URI: presentation.url,
      DURATION: await presentation.getDuration(),
      "SPRS-TYPE": "ad",
    });
  }
}

async function formatInterstitials(
  assets: InterstitialAsset[],
  interstitials: SessionInterstitial[],
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const filteredInterstitials = interstitials.filter((interstitial) =>
    isEqualTimeOffset(baseDate, interstitial.timeOffset, lookupDate),
  );

  for (const interstitial of filteredInterstitials) {
    const presentation = new Presentation(interstitial.uri);
    assets.push({
      URI: presentation.url,
      DURATION: await presentation.getDuration(),
      "SPRS-TYPE": interstitial.type,
    });
  }
}

function isEqualTimeOffset(
  baseDate: DateTime,
  timeOffset: number,
  lookupDate: DateTime,
) {
  return baseDate.plus({ seconds: timeOffset }).toISO() === lookupDate.toISO();
}
