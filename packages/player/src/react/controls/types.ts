import type { langMap } from "./i18n";

export interface Metadata {
  title?: string;
  subtitle?: string;
}

export type Lang = keyof typeof langMap;
