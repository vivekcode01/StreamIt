export default {
  async fetch(request: Request, env: NodeJS.ProcessEnv): Promise<Response> {
    // Manually set the env before we load the app in memory.
    process.env = env;

    const { createApp } = await import("../src");
    const app = await createApp({
      aot: false,
    });
    return await app.fetch(request);
  },
};
