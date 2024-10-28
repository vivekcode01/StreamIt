import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { scalar } from "shared/scalar";
import { jwt } from "@elysiajs/jwt";
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
    scalar({
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
      models: {
        User: UserSchema,
        LangCode: LangCodeSchema,
        VideoCodec: VideoCodecSchema,
        AudioCodec: AudioCodecSchema,
        Job: JobSchema,
        StorageFolder: StorageFolderSchema,
        StorageFile: StorageFileSchema,
      },
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
    }),
  )
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
