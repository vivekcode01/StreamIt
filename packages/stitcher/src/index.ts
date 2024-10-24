import { app } from "./app";
import { env } from "./env";

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
