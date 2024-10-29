import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@matvp91/elysia-swagger";
import { env } from "./env";
import { auth } from "./routes/auth";
import { jobs } from "./routes/jobs";
import { storage } from "./routes/storage";
import { profile } from "./routes/profile";
import {
  LangCodeSchema,
  VideoCodecSchema,
  AudioCodecSchema,
} from "shared/typebox";
import {
  UserSchema,
  JobSchema,
  StorageFolderSchema,
  StorageFileSchema,
} from "./types";

export type App = typeof app;

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      scalarVersion: "1.25.50",
      documentation: {
        info: {
          title: "Superstreamer API",
          description:
            "The Superstreamer API is organized around REST, returns JSON-encoded responses " +
            "and uses standard HTTP response codes and verbs.",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
      querySchema: t.Object({
        token: t.String(),
      }),
      onRequest({ query, scalarConfig }) {
        scalarConfig.authentication = {
          preferredSecurityScheme: "bearerAuth",
          http: {
            basic: {
              username: "",
              password: "",
            },
            bearer: {
              token: query.token,
            },
          },
        };
      },
    }),
  )
  .model({
    User: UserSchema,
    LangCode: LangCodeSchema,
    VideoCodec: VideoCodecSchema,
    AudioCodec: AudioCodecSchema,
    Job: JobSchema,
    StorageFolder: StorageFolderSchema,
    StorageFile: StorageFileSchema,
  })
  .use(auth)
  .use(jobs)
  .use(storage)
  .use(profile);

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
    console.log(`Started api on port ${env.PORT}`);
  },
);
