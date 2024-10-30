import { env } from "./env";
import { createApiClient } from "@superstreamer/api/client";

export const api = createApiClient(env.PUBLIC_API_ENDPOINT, {
  service: env.JWT_SECRET
    ? {
        name: "stitcher",
        secret: env.JWT_SECRET,
      }
    : undefined,
});
