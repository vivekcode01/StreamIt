import { hc } from "hono/client";
import type { z } from "zod";
import type { AppType } from "../src";
import type { assetSchema, groupSchema } from "../src/schemas/assets";
import type { jobSchema } from "../src/schemas/jobs";
import type {
  storageFileSchema,
  storageItemSchema,
} from "../src/schemas/storage";
import type { userSchema } from "../src/schemas/user";

export type Asset = z.infer<typeof assetSchema>;

export type Group = z.infer<typeof groupSchema>;

export type Job = z.infer<typeof jobSchema>;

export type StorageItem = z.infer<typeof storageItemSchema>;

export type StorageFile = z.infer<typeof storageFileSchema>;

export type User = z.infer<typeof userSchema>;

export * from "../src/schemas/assets";
export * from "../src/schemas/jobs";
export * from "../src/schemas/storage";
export * from "../src/schemas/user";

export type ApiClient = ReturnType<typeof createClient>;

/**
 * Create a client for API interaction
 * @param url
 * @param token
 * @returns
 */
export function createClient(url: string, token: string | null = null) {
  return hc<AppType>(url, {
    headers: () => {
      const headers: Record<string, string> = {};
      if (token !== null) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
  });
}

/**
 * Parse params to a record of strings.
 * @param obj
 * @returns
 */
export function toParams<T extends object>(obj: T): Record<keyof T, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, String(value)]),
  ) as Record<keyof T, string>;
}
