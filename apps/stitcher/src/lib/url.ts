import * as path from "node:path";
import type { AppContext } from "../app-context";

const uuidRegex = /^[a-z,0-9,-]{36,36}$/;

const ASSET_PROTOCOL = "asset:";

export function resolveUri(context: AppContext, inputUri: string) {
  let uri = inputUri;
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  const potentialUuid = uri.split("@", 2)[0];
  if (potentialUuid && uuidRegex.test(potentialUuid)) {
    uri = `${ASSET_PROTOCOL}//${uri}`;
  }

  if (uuidRegex.test(uri)) {
    // We prefer using the asset protocol for asset identification but we allow
    // just uuid's too and assume it's a valid assetId.
    uri = `${ASSET_PROTOCOL}//${uri}`;
  }

  if (uri.startsWith(`${ASSET_PROTOCOL}//`)) {
    const [assetId, prefix = "hls"] = uri
      .substring(`${ASSET_PROTOCOL}//`.length)
      .split("@");
    return `${context.env.PUBLIC_S3_ENDPOINT}/package/${assetId}/${prefix}/master.m3u8`;
  }

  throw new Error(`Invalid uri: "${uri}"`);
}

function buildUrl(
  url: string,
  query: Record<string, string | number | undefined | null> = {},
) {
  const queryString = Object.entries(query)
    .map(([key, value]) => {
      if (value === undefined || value === null) {
        return null;
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .filter((chunk) => chunk !== null)
    .join("&");

  return `${url}${queryString ? `?${queryString}` : ""}`;
}

export function joinUrl(urlFile: string, filePath: string) {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const urlBase = urlFile.substring(0, urlFile.lastIndexOf("/"));

  const url = new URL(urlBase);

  return `${url.protocol}//${url.host}${path.join(url.pathname, filePath)}`;
}

export function createUrl(
  context: AppContext,
  path: string,
  params: Record<string, string | number | undefined | null> = {},
) {
  return buildUrl(`${context.env.PUBLIC_STITCHER_ENDPOINT}/${path}`, params);
}

export function replaceUrlParams(
  inputUrl: string,
  params?: Record<string, string | number | undefined>,
) {
  let url = inputUrl;
  const allParams = {
    ...params,
    // Default params defined below.
    random: Math.floor(Math.random() * 10_000),
  };

  const entries = Object.entries(allParams);
  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    url = url.replaceAll(`{${key}}`, value.toString());
  }

  return url;
}
