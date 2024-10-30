import { env } from "./env";
import { createApiClient } from "@superstreamer/api/client";
import { createJwtServiceToken } from "shared/jwt";

let token: string | undefined;
if (env.JWT_SECRET) {
  token = await createJwtServiceToken(env.JWT_SECRET);
  console.info("Got a JWT_SECRET, calling API from Stitcher is enabled.");
}

export const api = createApiClient(env.PUBLIC_API_ENDPOINT, token);
