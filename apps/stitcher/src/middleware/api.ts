import { createClient } from "@superstreamer/api/client";
import { env } from "hono/adapter";
import { z } from "zod";
import type { ApiClient } from "@superstreamer/api/client";
import type { Context, Next } from "hono";

export type Api = ApiClient;

export function api() {
  return async (
    c: Context<{
      Variables: {
        api?: Api;
      };
    }>,
    next: Next,
  ) => {
    const { PUBLIC_API_ENDPOINT } = z
      .object({
        PUBLIC_API_ENDPOINT: z.string().optional(),
      })
      .parse(env(c));

    if (PUBLIC_API_ENDPOINT) {
      const client = createClient(PUBLIC_API_ENDPOINT);
      c.set("api", client);
    }

    await next();
  };
}
