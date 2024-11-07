import { treaty } from "@elysiajs/eden";
import type { App } from "../src";

// API types are public by definition, we'll re-export them all.
export type * from "../src/types";

export type ApiClient = ReturnType<typeof createApiClient>;

interface CreateApiClientOptions {
  token?: string | null;
  apiKey?: string | null;
}

export function createApiClient(
  domain: string,
  options?: CreateApiClientOptions,
) {
  return treaty<App>(domain, {
    headers: () => {
      const headers: Record<string, string> = {};
      if (options?.token) {
        headers["Authorization"] = `Bearer ${options.token}`;
      } else if (options?.apiKey) {
        headers["x-api-key"] = options.apiKey;
      }
      return headers;
    },
  });
}
