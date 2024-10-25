import { envOverride } from "shared/env";
import { assert } from "./assert";
import { env } from "./env";
import type { KVNamespace } from "@cloudflare/workers-types";

/**
 * Support for Cloudflare KV
 * @returns
 */
function createServerlessKv() {
  assert(envOverride, "envOverride for Cloudflare worker");

  const cloudflareEnv = envOverride as { kv: KVNamespace };
  const client = cloudflareEnv.kv;

  return {
    async set(key: string, value: string, ttl: number) {
      await client.put(key, value, {
        expirationTtl: ttl,
      });
    },
    async get(key: string) {
      return await client.get(key);
    },
  };
}

/**
 * Support for Redis.
 * @returns
 */
async function createRedisKv() {
  const { createClient } = await import("redis");
  const client = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });

  await client.connect();

  return {
    async set(key: string, value: string, ttl: number) {
      await client.set(`stitcher:${key}`, value, {
        EX: ttl,
      });
    },
    async get(key: string) {
      return await client.get(`stitcher:${key}`);
    },
  };
}

export const kv = env.SERVERLESS ? createServerlessKv() : await createRedisKv();
