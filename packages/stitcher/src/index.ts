import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import { env } from "./env";
import { outApp } from "./routes/out";
import { sessionApp } from "./routes/session";

const app = new Hono()
  .use(cors())
  .route("/session", sessionApp)
  .route("/out", outApp);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Superstreamer Stitcher API",
        version: "1.0.0",
        description:
          "Realtime playlist manipulator. Can be used for ad, bumper or other HLS interstitials insertion on-the-fly. Can apply filters to playlists.",
      },
    },
  }),
);

export default {
  ...app,
  port: env.PORT,
};
