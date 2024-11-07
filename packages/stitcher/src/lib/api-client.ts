import { createApiClient } from "@superstreamer/api/client";
import { env } from "../env";

export const api = createApiClient(env.PUBLIC_API_ENDPOINT, {
  apiKey: env.SUPER_SECRET,
});
