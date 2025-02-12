import { Hono } from "hono";
import { sign } from "hono/jwt";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { env } from "../env";
import { apiError } from "../errors";
import { getUserIdByCredentials } from "../repositories/users";
import { validator } from "../validator";

export const tokenApp = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a token",
    description: "Create an auth token for given credentials",
    tags: ["User"],
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                token: z.string(),
              }),
            ),
          },
        },
      },
    },
  }),
  validator(
    "json",
    z.object({
      username: z.string(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const credentials = c.req.valid("json");
    const id = await getUserIdByCredentials(
      credentials.username,
      credentials.password,
    );
    if (id === null) {
      throw apiError("USER_INVALID_CREDENTIALS");
    }
    const token = await sign(
      {
        id,
      },
      env.SUPER_SECRET,
    );

    return c.json({ token }, 200);
  },
);
