import { cors } from "@elysiajs/cors";
import { swagger } from "@matvp91/elysia-swagger";
import { Elysia, t } from "elysia";
import { env } from "./env";
import { errors } from "./errors";
import { assets } from "./routes/assets";
import { jobs } from "./routes/jobs";
import { storage } from "./routes/storage";
import { token } from "./routes/token";
import { user } from "./routes/user";
import {
  AssetSchema,
  GroupSchema,
  JobSchema,
  StorageFileSchema,
  StorageFolderSchema,
  UserSchema,
} from "./types";

// Import workers and they'll start running immediately.
import "./workers";

// Run migrations on start.
import "./db/migrate";

export type App = typeof app;

const app = new Elysia()
  .use(errors())
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
        tags: [
          {
            name: "Jobs",
            description:
              "Handle tasks related to jobs, including video processing and job status monitoring.",
          },
          {
            name: "Assets",
            description: "Inspect assets.",
          },
          {
            name: "Storage",
            description: "Anything related to your configured S3 bucket.",
          },
          {
            name: "User",
            description:
              "Methods related to user actions, including authentication and personal settings updates.",
          },
        ],
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
    Job: JobSchema,
    StorageFolder: StorageFolderSchema,
    StorageFile: StorageFileSchema,
    Asset: AssetSchema,
    Group: GroupSchema,
    User: UserSchema,
  })
  .use(jobs)
  .use(storage)
  .use(assets)
  .use(token)
  .use(user);

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
