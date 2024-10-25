export default {
  async fetch(request: Request, env: NodeJS.ProcessEnv): Promise<Response> {
    // Manually set the env before we load the app in memory.
    process.env = env;

    const { app } = await import("../index");
    return await app.fetch(request);
  },
};
