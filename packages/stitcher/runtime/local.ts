import { parseEnv } from "shared/env";
import { createApp } from "../src";

const env = parseEnv((t) => ({
  PORT: t.Number({ default: 52002 }),
  HOST: t.String({ default: "0.0.0.0" }),
}));

const app = createApp({
  aot: true,
});

app.on("stop", () => {
  process.exit(0);
});

process
  .on("beforeExit", app.stop)
  .on("SIGINT", app.stop)
  .on("SIGTERM", app.stop);

app.listen(
  {
    port: env.PORT,
    hostname: env.HOST,
  },
  () => {
    console.log(`Started stitcher on port ${env.PORT}`);
  },
);
