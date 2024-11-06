import { parseEnv } from "shared/env";

export const env = parseEnv((t) => ({
  SERVERLESS: t.Boolean({ default: false }),

  REDIS_HOST: t.String(),
  REDIS_PORT: t.Number(),
  PUBLIC_S3_ENDPOINT: t.String(),
  PUBLIC_STITCHER_ENDPOINT: t.String(),
  PUBLIC_API_ENDPOINT: t.String(),

  SUPER_SECRET: t.Optional(t.String()),
}));
