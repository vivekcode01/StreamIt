import { treaty } from "@elysiajs/eden";
import { SignJWT } from "jose";
import type { App } from "./src";

// API types are public by definition, we'll re-export them all.
export type * from "./src/types";

export type ApiClient = ReturnType<typeof createApiClient>;

interface CreateApiClientOptions {
  token?: string | null;
  service?: {
    name: string;
    secret: string;
  };
}

export function createApiClient(
  domain: string,
  options?: CreateApiClientOptions,
) {
  let token = options?.token;

  if (options?.service) {
    const jwt = new SignJWT({
      type: "service",
      name: options.service.name,
    }).setProtectedHeader({ alg: "HS256" });

    const key = new TextEncoder().encode(options.service.secret);

    jwt.sign(key).then((value) => {
      token = value;
    });
  }

  return treaty<App>(domain, {
    headers: () => {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      return headers;
    },
  });
}
