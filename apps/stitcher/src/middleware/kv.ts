import { env, getRuntimeKey } from "hono/adapter";
import { assert } from "shared/assert";
import { z } from "zod";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { Context, Next } from "hono";

export interface Kv {
  set(key: string, value: string, ttl: number): Promise<void>;
  get(key: string): Promise<string | null>;
}

export function kv() {
  return async (
    c: Context<{
      Variables: {
        kv: Kv;
      };
      Bindings: {
        kv?: KVNamespace;
      };
    }>,
    next: Next,
  ) => {
    const runtimeKey = getRuntimeKey();

    if (runtimeKey === "workerd") {
      const { kv } = c.env;
      assert(kv);

      c.set("kv", {
        async set(key, value, ttl) {
          await kv.put(key, value, {
            expirationTtl: ttl,
          });
        },
        async get(key) {
          return await kv.get(key);
        },
      });
    } else {
      const { REDIS_HOST, REDIS_PORT } = z
        .object({
          REDIS_HOST: z.string(),
          REDIS_PORT: z.coerce.number(),
        })
        .parse(env(c));

      const REDIS_PREFIX = "stitcher";

      const { createClient } = await import("redis");
      const client = createClient({
        socket: {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
      });

      await client.connect();

      c.set("kv", {
        async set(key, value, ttl) {
          await client.set(`${REDIS_PREFIX}:${key}`, value, {
            EX: ttl,
          });
        },
        async get(key) {
          return await client.get(`${REDIS_PREFIX}:${key}`);
        },
      });
    }

    await next();
  };
}
