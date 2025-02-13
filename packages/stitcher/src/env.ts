import { getEnv } from "shared/env";
import { z } from "zod";

export const env = getEnv(
  z.object({
    PORT: z.coerce.number().default(52002),

    KV: z.enum(["memory", "redis", "cloudflare-kv"]).default("redis"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),

    PUBLIC_S3_ENDPOINT: z.string(),
    PUBLIC_STITCHER_ENDPOINT: z.string(),
    PUBLIC_API_ENDPOINT: z.string().optional(),

    // Secret is optional, if we don't provide it, we won't be able to
    // call API requests but one might not need to do that.
    SUPER_SECRET: z.string().optional(),
  }),
);
