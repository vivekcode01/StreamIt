import { createClient } from "redis";
import { env } from "../env";

const client = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

await client.connect();

export default {
  async set(key: string, value: string, ttl: number) {
    await client.set(`stitcher:${key}`, value, {
      EX: ttl,
    });
  },
  async get(key: string) {
    return await client.get(`stitcher:${key}`);
  },
};
