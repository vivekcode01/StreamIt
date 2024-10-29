import { SignJWT } from "jose";
import { env } from "./env";
import { createApiClient } from "@superstreamer/api/client";

const jwt = new SignJWT({
  type: "service",
}).setProtectedHeader({ alg: "HS256" });

const secret = new TextEncoder().encode(env.JWT_SECRET);
const token = await jwt.sign(secret);

export const api = createApiClient(env.PUBLIC_API_ENDPOINT, token);
