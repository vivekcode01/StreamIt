import { getEnv } from "shared/env";
import { z } from "zod";

const env = getEnv(
  z.object({
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
  }),
);

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
