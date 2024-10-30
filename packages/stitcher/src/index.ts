import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@matvp91/elysia-swagger";
import { session } from "./routes/session";

type CreateAppOptions = {
  aot: boolean;
};

export const createApp = ({ aot }: CreateAppOptions) =>
  new Elysia({
    aot,
  })
    .use(cors())
    .use(
      swagger({
        scalarVersion: "1.25.50",
        documentation: {
          info: {
            title: "Superstreamer Stitcher API",
            version: "1.0.0",
            description:
              "Realtime playlist manipulator. Can be used for ad, bumper or other HLS interstitials insertion on-the-fly. Can apply filters to playlists.",
          },
        },
      }),
    )
    .use(session);
