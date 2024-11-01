import bearer from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { env } from "../env";
import { DeliberateError } from "../errors";
import { getUserIdByCredentials } from "../repositories/users";

const jwtUser = jwt({
  name: "jwtUser",
  schema: t.Union([
    // User tokens describe a user interacting with the API.
    t.Object({
      type: t.Literal("user"),
      id: t.Number(),
    }),
    // Service tokens, such as Stitcher.
    t.Object({
      type: t.Literal("service"),
      name: t.String(),
    }),
  ]),
  secret: env.JWT_SECRET,
});

export const authUser = new Elysia()
  .use(bearer())
  .use(jwtUser)
  .derive({ as: "scoped" }, async ({ bearer, jwtUser }) => {
    const token = await jwtUser.verify(bearer);
    if (!token) {
      throw new DeliberateError({ type: "ERR_UNAUTHORIZED" });
    }
    return { user: token };
  });

export const token = new Elysia().use(jwtUser).post(
  "/token",
  async ({ jwtUser, body }) => {
    const id = await getUserIdByCredentials(body.username, body.password);
    if (id === null) {
      throw new DeliberateError({ type: "ERR_USER_INVALID_CREDENTIALS" });
    }
    return await jwtUser.sign({
      type: "user",
      id,
    });
  },
  {
    detail: {
      summary: "Create a token",
      tags: ["User"],
    },
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    response: {
      200: t.String(),
    },
  },
);
