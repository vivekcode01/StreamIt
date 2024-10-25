import { createClient } from "redis";
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

  const parseKey = (key: string): [string, string] => {
    const [ns, name] = key.split(/:(.*)/s);
    assert(ns, "no namespace");
    assert(name, "no name");
    return [ns, name];
  };

  const getClient = (ns: string): KVNamespace => {
    const client = envOverride?.[ns as keyof typeof envOverride] as
      | KVNamespace
      | undefined;
    assert(client, "no client");
    return client;
  };

  return {
    async set(key: string, value: string, ttl: number) {
      const [ns, name] = parseKey(key);
      const client = getClient(ns);
      await client.put(name, value, {
        expirationTtl: ttl,
      });
    },
    async get(key: string) {
      const [ns, name] = parseKey(key);
      const client = getClient(ns);
      return await client.get(name);
    },
  };
}

/**
 * Support for Redis.
 * @returns
 */
async function createRedisKv() {
  const REDIS_PREFIX = "stitcher";

  const client = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });

  await client.connect();

  return {
    async set(key: string, value: string, ttl: number) {
      await client.set(`${REDIS_PREFIX}:${key}`, value, {
        EX: ttl,
      });
    },
    async get(key: string) {
      return await client.get(`${REDIS_PREFIX}:${key}`);
    },
  };
}

export const kv = env.SERVERLESS ? createServerlessKv() : await createRedisKv();
