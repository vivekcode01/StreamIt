import { hc } from "hono/client";
import type { AppType } from "../src";
import type {
  getAssetResponseSchema,
  getGroupResponseSchema,
} from "../src/schemas/assets";
import type { getJobResponseSchema } from "../src/schemas/jobs";
import type {
  getStorageFileResponseSchema,
  unstable_storageFolder,
} from "../src/schemas/storage";
import type { z } from "zod";

export type Asset = z.infer<typeof getAssetResponseSchema>;

export type Group = z.infer<typeof getGroupResponseSchema>;

export type Job = z.infer<typeof getJobResponseSchema>;

export type StorageFolderItem = z.infer<typeof unstable_storageFolder>;

export type StorageFile = z.infer<typeof getStorageFileResponseSchema>;

export type HonoClient = ReturnType<typeof hc<AppType>>;

export * from "../src/schemas/assets";

export function createClient(url: string) {
  let token_: string | null = null;

  const client = hc<AppType>(url, {
    headers: () => {
      const headers: Record<string, string> = {};
      if (token_ !== null) {
        headers["Authorization"] = `Bearer ${token_}`;
      }
      return headers;
    },
  });

  const setToken = (token: string | null) => {
    token_ = token;
  };

  return {
    client,
    setToken,
  };
}

export function toParams<T extends object>(obj: T): Record<keyof T, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, String(value)]),
  ) as Record<keyof T, string>;
}

class ApiClient {
  private token_: string | null = null;

  private client_: HonoClient;

  constructor(baseUrl: string) {
    this.client_ = hc<AppType>(baseUrl, {
      headers: () => {
        const headers: Record<string, string> = {};
        if (this.token_ !== null) {
          headers["Authorization"] = `Bearer ${this.token_}`;
        }
        return headers;
      },
    });
  }

  setToken(token: string | null) {
    this.token_ = token;
  }
}
