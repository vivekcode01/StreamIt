import bearer from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { env } from "./env";
import { DeliberateError } from "./errors";

export const authUserJwt = jwt({
  name: "authUserJwt",
  schema: t.Object({
    id: t.Number(),
  }),
  secret: env.SUPER_SECRET,
});

export const authUser = new Elysia()
  .use(bearer())
  .use(authUserJwt)
  .derive({ as: "scoped" }, async ({ bearer, authUserJwt }) => {
    if (!bearer) {
      throw new DeliberateError({ type: "ERR_UNAUTHORIZED" });
    }
    const token = await authUserJwt.verify(bearer);
    if (!token) {
      throw new DeliberateError({ type: "ERR_USER_INVALID_TOKEN" });
    }
    return { user: token };
  });

export const authService = new Elysia().derive(
  { as: "scoped" },
  async ({ headers }) => {
    if (headers["x-api-key"] !== env.SUPER_SECRET) {
      throw new DeliberateError({ type: "ERR_UNAUTHORIZED" });
    }
    return { service: {} };
  },
);
