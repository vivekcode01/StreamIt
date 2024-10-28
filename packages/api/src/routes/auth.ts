import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../env";
import { getUserIdByCredentials } from "../db/repo-user";
import bearer from "@elysiajs/bearer";

export const authJwt = new Elysia().use(
  jwt({
    name: "authJwt",
    schema: t.Object({
      id: t.Number(),
    }),
    secret: env.JWT_SECRET,
  }),
);

export const authUser = new Elysia()
  .use(bearer())
  .use(authJwt)
  .derive({ as: "scoped" }, async ({ bearer, authJwt, set }) => {
    const token = await authJwt.verify(bearer);
    if (!token) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    return {
      userId: token.id,
    };
  });

export const auth = new Elysia().use(authJwt).post(
  "/login",
  async ({ authJwt, body, set }) => {
    const id = await getUserIdByCredentials(body.username, body.password);
    if (id === null) {
      set.status = 400;
      return "Unauthorized";
    }
    return {
      token: await authJwt.sign({ id }),
    };
  },
  {
    detail: {
      summary: "Create a token",
    },
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    response: {
      400: t.Literal("Unauthorized"),
      200: t.Object({
        token: t.String(),
      }),
    },
  },
);
