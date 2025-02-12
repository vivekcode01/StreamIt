import { ApiClient } from "@superstreamer/api/client";

export const api = new ApiClient(window.__ENV__.PUBLIC_API_ENDPOINT);
