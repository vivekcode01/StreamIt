import { createApiClient } from "@superstreamer/api/client";
import { env } from "../env";

export const api = createApiClient(env.PUBLIC_API_ENDPOINT, {
  service: env.SUPER_SECRET
    ? {
        name: "stitcher",
        secret: env.SUPER_SECRET,
      }
    : undefined,
});
