import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import {
  LangCodeSchema,
  VideoCodecSchema,
  AudioCodecSchema,
} from "shared/typebox";
import { customCss } from "shared/scalar";
import { env } from "./env";
import { JobSchema, StorageFolderSchema, StorageFileSchema } from "./types";
import { auth } from "./routes/auth";
import { jobs } from "./routes/jobs";
import { storage } from "./routes/storage";

export type App = typeof app;

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
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
            bearer: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
      scalarConfig: {
        hideDownloadButton: true,
        customCss,
        authentication: {
          preferredSecurityScheme: "bearer",
          http: {
            basic: {
              username: "",
              password: "",
            },
            bearer: {
              token: "hello",
            },
          },
        },
      },
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
    }),
  )
  .model({
    LangCode: LangCodeSchema,
    VideoCodec: VideoCodecSchema,
    AudioCodec: AudioCodecSchema,
    Job: JobSchema,
    StorageFolder: StorageFolderSchema,
    StorageFile: StorageFileSchema,
  })
  .use(auth)
  .use(jobs)
  .use(storage);

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
