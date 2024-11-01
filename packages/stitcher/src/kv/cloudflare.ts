import type { KVNamespace } from "@cloudflare/workers-types";

const env = process.env as unknown as { kv: KVNamespace };

export default {
  async set(key: string, value: string, ttl: number) {
    await env.kv.put(key, value, {
      expirationTtl: ttl,
    });
  },
  async get(key: string) {
    return await env.kv.get(key);
  },
};
