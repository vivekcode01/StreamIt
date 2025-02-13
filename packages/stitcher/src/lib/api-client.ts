import { createClient } from "@superstreamer/api/client";
import { env } from "../env";

export const api = env.PUBLIC_API_ENDPOINT
  ? createClient(env.PUBLIC_API_ENDPOINT)
  : null;
