import { SignJWT } from "jose";

export async function createJwtServiceToken(secret: string) {
  const jwt = new SignJWT({
    type: "service",
  }).setProtectedHeader({ alg: "HS256" });
  return await jwt.sign(new TextEncoder().encode(secret));
}
