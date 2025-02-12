import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { env } from "./env";
import { ApiError } from "./errors";
import { assetsApp } from "./routes/assets";
import { jobsApp } from "./routes/jobs";
import { storageApp } from "./routes/storage";
import { tokenApp } from "./routes/token";
import { userApp } from "./routes/user";

// Import workers and they'll start running immediately.
import "./workers";

// Run migrations on start.
import "./db/migrate";

const app = new Hono()
  .route("/token", tokenApp)
  .route("/user", userApp)
  .route("/storage", storageApp)
  .route("/jobs", jobsApp)
  .route("/assets", assetsApp);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Superstreamer API",
        version: "1.0.0",
        description:
          "The Superstreamer API is organized around REST, returns JSON-encoded responses " +
          "and uses standard HTTP response codes and verbs.",
      },
      components: {
        securitySchemes: {
          userToken: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }),
);

app.onError((error, c) => {
  if (error instanceof ApiError) {
    return c.json(
      {
        code: error.code,
      },
      error.status,
    );
  }

  return c.json(
    {
      message:
        "Unexpected error, this is most likely a bug. Please, report it.",
    },
    500,
  );
});

export default {
  ...app,
  port: env.PORT,
};

export type AppType = typeof app;
