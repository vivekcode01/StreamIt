import { env } from "../env";

async function createKv() {
  if (env.SERVERLESS) {
    return await import("./cloudflare");
  }
  return await import("./redis");
}

export const kv = (await createKv()).default;
