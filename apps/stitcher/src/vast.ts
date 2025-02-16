import { DOMParser } from "@xmldom/xmldom";
import * as uuid from "uuid";
import { VASTClient } from "vast-client";
import { resolveUri } from "./lib/url";
import type { Api } from "./middleware/api";
import type { Globals } from "./middleware/globals";
import type { Asset } from "./types";
import type { VastAd, VastCreativeLinear, VastResponse } from "vast-client";

const NAMESPACE_UUID_AD = "5b212a7e-d6a2-43bf-bd30-13b1ca1f9b13";

export async function getAssetsFromVastUrl(
  url: string,
  context: {
    globals: Globals;
    api?: Api;
  },
) {
  const vastClient = new VASTClient();
  const vastResponse = await vastClient.get(url);
  return await mapVastResponseToAssets(vastResponse, context);
}

export async function getAssetsFromVastData(
  data: string,
  context: {
    globals: Globals;
    api?: Api;
  },
) {
  const vastClient = new VASTClient();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, "text/xml");
  const vastResponse = await vastClient.parseVAST(xml);
  return await mapVastResponseToAssets(vastResponse, context);
}

async function scheduleForPackage(assetId: string, url: string, api: Api) {
  await api.jobs.pipeline.$post({
    json: {
      assetId,
      group: "ad",
      inputs: [
        {
          path: url,
          type: "video",
        },
        {
          path: url,
          type: "audio",
          language: "eng",
        },
      ],
      streams: [
        {
          type: "video",
          codec: "h264",
          height: 720,
        },
        {
          type: "video",
          codec: "h264",
          height: 480,
        },
        {
          type: "audio",
          codec: "aac",
          language: "eng",
        },
      ],
    },
  });
}

async function fetchAsset(api: Api, id: string) {
  const response = await api.assets[":id"].$get({
    param: { id },
  });
  if (!response.ok) {
    return null;
  }
  const asset = await response.json();
  if (!asset) {
    return null;
  }
  return asset;
}

async function getAdUrl(
  creative: VastCreativeLinear,
  context: {
    globals: Globals;
    api?: Api;
  },
) {
  const url = getCreativeStreamingUrl(creative);
  if (url) {
    return url;
  }

  if (context.api) {
    const id = getAdId(creative);
    const asset = await fetchAsset(context.api, id);

    if (asset) {
      return resolveUri(`asset://${asset.id}`, context);
    }

    const staticUrl = getCreativeStaticUrl(creative);
    if (staticUrl) {
      await scheduleForPackage(id, staticUrl, context.api);
    }
  }

  return null;
}

async function mapAdToAsset(
  ad: VastAd,
  context: {
    globals: Globals;
    api?: Api;
  },
): Promise<Asset | null> {
  const creative = getCreative(ad);
  if (!creative) {
    return null;
  }

  const url = await getAdUrl(creative, context);
  if (!url) {
    return null;
  }

  return {
    url,
    duration: creative.duration,
  };
}

async function mapVastResponseToAssets(
  response: VastResponse,
  context: {
    globals: Globals;
    api?: Api;
  },
) {
  const assets: Asset[] = [];

  for (const ad of response.ads) {
    const asset = await mapAdToAsset(ad, context);
    if (!asset) {
      continue;
    }
    assets.push(asset);
  }

  return assets;
}

function getCreativeStaticUrl(creative: VastCreativeLinear) {
  let fileUrl: string | null = null;
  let lastHeight = 0;

  for (const mediaFile of creative.mediaFiles) {
    if (mediaFile.mimeType === "video/mp4" && mediaFile.height > lastHeight) {
      lastHeight = mediaFile.height;
      fileUrl = mediaFile.fileURL;
    }
  }

  return fileUrl;
}

function getCreativeStreamingUrl(creative: VastCreativeLinear) {
  for (const mediaFile of creative.mediaFiles) {
    if (mediaFile.mimeType === "application/x-mpegURL") {
      return mediaFile.fileURL;
    }
  }
  return null;
}

function getCreative(ad: VastAd) {
  for (const creative of ad.creatives) {
    if (creative.type === "linear") {
      return creative as VastCreativeLinear;
    }
  }
  return null;
}

function getAdId(creative: VastCreativeLinear) {
  if (creative.adId && creative.id) {
    // Do not change this, or we'll have a mismatch between the already encoded ad's and the other.
    // See https://iabtechlab.com/guidance-for-uniquely-identifying-creative-asset-ids-in-vast-2/
    const adId = [creative.adId, creative.id].join(".");
    return uuid.v5(adId, NAMESPACE_UUID_AD);
  }

  throw new Error("Failed to generate adId");
}
