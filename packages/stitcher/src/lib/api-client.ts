import { createApiClient } from "@superstreamer/api/client";
import { env } from "../env";

export const api = env.PUBLIC_API_ENDPOINT
  ? createApiClient(env.PUBLIC_API_ENDPOINT, {
      apiKey: env.SUPER_SECRET,
    })
  : null;
