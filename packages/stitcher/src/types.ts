import type { DateTime } from "luxon";

export interface InterstitialVast {
  url?: string;
  data?: string;
}

export interface InterstitialAsset {
  url: string;
  duration?: number;
  kind?: "ad" | "bumper";
}

export interface Interstitial {
  dateTime: DateTime;
  asset?: InterstitialAsset;
  vast?: InterstitialVast;
  assetList?: {
    url: string;
  };
}
