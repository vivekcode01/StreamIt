import { env } from "./env";
import { createApiClient } from "@superstreamer/api/client";

export const api = createApiClient(env.PUBLIC_API_ENDPOINT);

export type * from "@superstreamer/api/client";
