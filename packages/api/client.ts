import { treaty } from "@elysiajs/eden";
import { SignJWT } from "jose";
import type { App } from "./src";

export type * from "./src/models";

export type ApiClient = ReturnType<typeof createApiClient>;

type CreateApiClientOptions = {
  token?: string | null;
  service?: {
    name: string;
    secret: string;
  };
};

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
