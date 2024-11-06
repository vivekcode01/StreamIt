import { parseEnv } from "shared/env";

const env = parseEnv((z) => ({
  // config.env
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
}));

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
