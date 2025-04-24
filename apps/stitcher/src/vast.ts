import { DOMParser } from "@xmldom/xmldom";
import * as uuid from "uuid";
import { VASTClient } from "vast-client";
import type { VastAd, VastCreativeLinear, VastResponse } from "vast-client";
import type { AppContext } from "./app-context";
import { assert } from "./assert";
import { replaceUrlParams, resolveUri } from "./lib/url";
import type { Asset, VastParams } from "./types";

const NAMESPACE_UUID_AD = "5b212a7e-d6a2-43bf-bd30-13b1ca1f9b13";

export async function getAssetsFromVastParams(
  context: AppContext,
  params: VastParams,
  urlParams: Record<string, string | number | undefined>,
) {
  const vastClient = new VASTClient();

  const assets: Asset[] = [];

  if (params.url) {
    const vastUrl = replaceUrlParams(params.url, urlParams);
    const vastResponse = await vastClient.get(vastUrl);
    const vastAssets = await mapVastResponseToAssets(context, vastResponse);
    assets.push(...vastAssets);
  }

  if (params.data) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(params.data, "text/xml");
    const vastResponse = await vastClient.parseVAST(xml);
    const vastAssets = await mapVastResponseToAssets(context, vastResponse);
    assets.push(...vastAssets);
  }

  return assets;
}

async function scheduleForPackage(
  context: AppContext,
  assetId: string,
  url: string,
) {
  assert(context.api);
  await context.api.jobs.pipeline.$post({
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

async function fetchAsset(context: AppContext, id: string) {
  assert(context.api);
  const response = await context.api.assets[":id"].$get({
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

async function getAdUrl(context: AppContext, creative: VastCreativeLinear) {
  const url = getCreativeStreamingUrl(creative);
  if (url) {
    return url;
  }

  if (context.api) {
    const id = getAdId(creative);
    const asset = await fetchAsset(context, id);

    if (asset) {
      return resolveUri(context, `asset://${asset.id}`);
    }

    const staticUrl = getCreativeStaticUrl(creative);
    if (staticUrl) {
      await scheduleForPackage(context, id, staticUrl);
    }
  }

  return null;
}

async function mapAdToAsset(
  context: AppContext,
  ad: VastAd,
): Promise<Asset | null> {
  const creative = getCreative(ad);
  if (!creative) {
    return null;
  }

  const url = await getAdUrl(context, creative);
  if (!url) {
    return null;
  }

  return {
    url,
    duration: creative.duration,
  };
}

async function mapVastResponseToAssets(
  context: AppContext,
  response: VastResponse,
) {
  const assets: Asset[] = [];

  for (const ad of response.ads) {
    const asset = await mapAdToAsset(context, ad);
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
