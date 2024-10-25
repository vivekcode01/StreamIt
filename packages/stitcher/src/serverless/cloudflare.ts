import { setEnvOverride } from "shared/env";
import type { Env } from "bun";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Pass on the env variables before we import the app,
    // serverless does not support process.env, it's handler based.
    setEnvOverride(env);
    const { app } = await import("../index");
    return await app.fetch(request);
  },
};
