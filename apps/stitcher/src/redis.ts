import { env } from "hono/adapter";
import { createClient } from "redis";
import type { Context } from "hono";
import type { RedisClientType } from "redis";

let redis: RedisClientType | null = null;

const REDIS_PREFIX = "stitcher";

async function getRedis(context: Context) {
  if (!redis) {
    const { REDIS_HOST, REDIS_PORT } = env<{
      REDIS_HOST: string;
      REDIS_PORT: string;
    }>(context);

    redis = createClient({
      socket: {
        host: REDIS_HOST,
        port: +REDIS_PORT,
      },
    });

    await redis.connect();
  }
  return redis;
}

export async function getRedisKey(context: Context, key: string) {
  const redis = await getRedis(context);
  return await redis.get(`${REDIS_PREFIX}:${key}`);
}

export async function setRedisKeyValue(
  context: Context,
  key: string,
  value: string,
  ttl: number,
) {
  const redis = await getRedis(context);
  await redis.set(`${REDIS_PREFIX}:${key}`, value, {
    EX: ttl,
  });
}
