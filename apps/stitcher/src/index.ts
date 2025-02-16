import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import { outApp } from "./routes/out";
import { sessionsApp } from "./routes/sessions";

const app = new Hono()
  .use(cors())
  .route("/sessions", sessionsApp)
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

export default app;
