import { env } from "hono/adapter";
import { z } from "zod";
import type { Context, Next } from "hono";

export interface Globals {
  s3Endpoint: string;
  stitcherEndpoint: string;
}

export function globals() {
  return async (
    c: Context<{
      Variables: {
        globals: Globals;
      };
    }>,
    next: Next,
  ) => {
    const { PUBLIC_S3_ENDPOINT, PUBLIC_STITCHER_ENDPOINT } = z
      .object({
        PUBLIC_S3_ENDPOINT: z.string(),
        PUBLIC_STITCHER_ENDPOINT: z.string(),
      })
      .parse(env(c));

    c.set("globals", {
      s3Endpoint: PUBLIC_S3_ENDPOINT,
      stitcherEndpoint: PUBLIC_STITCHER_ENDPOINT,
    });

    await next();
  };
}
