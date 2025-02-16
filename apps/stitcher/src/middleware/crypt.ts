import { env } from "hono/adapter";
import * as secureEncrypt from "secure-encrypt";
import { z } from "zod";
import type { Context, Next } from "hono";

export interface Encdec {
  encrypt(value: string): string;
  decrypt(value: string): string;
}

export function encdec() {
  return async (
    c: Context<{
      Variables: {
        encdec: Encdec;
      };
    }>,
    next: Next,
  ) => {
    const { SUPER_SECRET } = z
      .object({
        SUPER_SECRET: z.string().default("__UNSECURE__"),
      })
      .parse(env(c));

    c.set("encdec", {
      encrypt(value) {
        return btoa(secureEncrypt.encrypt(value, SUPER_SECRET));
      },
      decrypt(value) {
        return secureEncrypt.decrypt(atob(value), SUPER_SECRET);
      },
    });

    await next();
  };
}
