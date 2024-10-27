import { createApiClient } from "@superstreamer/api/client";

export type * from "@superstreamer/api/client";

export let api: ReturnType<typeof createApiClient> = createApiClient(
  window.__ENV__.PUBLIC_API_ENDPOINT,
);

export function setApiToken(token: string | null) {
  api = createApiClient(window.__ENV__.PUBLIC_API_ENDPOINT, token);
}
