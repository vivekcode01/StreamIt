import { parseEnv } from "shared/env";
import { createApp } from "../src";

const env = parseEnv((z) => ({
  PORT: z.coerce.number().default(52002),
  HOST: z.string().default("0.0.0.0"),
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
