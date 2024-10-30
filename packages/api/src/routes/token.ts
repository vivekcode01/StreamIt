import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { env } from "../env";
import { getUserIdByCredentials } from "../db/repositories/user-repository";

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
  .derive({ as: "scoped" }, async ({ bearer, jwtUser, set }) => {
    const token = await jwtUser.verify(bearer);
    if (!token) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    if (token.type === "user") {
      return {
        user: { type: "user", id: token.id },
      };
    }
    if (token.type === "service") {
      return {
        user: { type: "service" },
      };
    }
    throw new Error("Invalid token type");
  });

export const token = new Elysia().use(jwtUser).post(
  "/token",
  async ({ jwtUser, body, set }) => {
    const id = await getUserIdByCredentials(body.username, body.password);
    if (id === null) {
      set.status = 400;
      return "Unauthorized";
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
      400: t.Literal("Unauthorized"),
      200: t.String(),
    },
  },
);
