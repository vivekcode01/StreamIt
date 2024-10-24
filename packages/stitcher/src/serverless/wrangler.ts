import { setEnvVars } from "shared/env";
import type { Env } from "bun";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    setEnvVars(env);
    const { app } = await import("../app");
    return await app.fetch(request);
  },
};
