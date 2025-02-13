import { RedisKv } from "./redis-kv";
import { env } from "../../env";

export interface Kv {
  set(key: string, value: string, ttl: number): Promise<void>;
  get(key: string): Promise<string | null>;
}

export const kv: Kv = new RedisKv(env.REDIS_HOST, env.REDIS_PORT);
