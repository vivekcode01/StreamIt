import { verify } from "hono/jwt";
import { env } from "./env";
import type { Context, Next } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";

export interface AuthVariables {
  user:
    | {
        // Reflects a user.
        role: "user";
        id: number;
      }
    | {
        // Reflects an external service, such as stitcher.
        role: "service";
      };
}

/**
 * Check whether we are authenticated.
 * @returns
 */
export function auth() {
  return async (c: Context, next: Next) => {
    let token: string | undefined;

    const credentials = c.req.raw.headers.get("Authorization");

    if (credentials) {
      const parts = credentials.split(/\s+/);

      if (parts.length === 2) {
        token = parts[1];
      }
    }

    if (!token) {
      return c.json({ code: "ERR_AUTH_TOKEN_MISSING" }, 401);
    }

    let payload: JWTPayload;
    try {
      payload = await verify(token, env.SUPER_SECRET);
    } catch {
      return c.json({ code: "ERR_AUTH_INVALID_TOKEN" });
    }

    c.set("user", payload);

    await next();
  };
}
