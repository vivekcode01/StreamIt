import { treaty } from "@elysiajs/eden";
import type { App } from "./";

export type * from "./types";

export function createApiClient(apiKey: string) {
  return treaty<App>(apiKey);
}
