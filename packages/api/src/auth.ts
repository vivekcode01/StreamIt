import bearer from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { env } from "./env";
import { DeliberateError } from "./errors";

type Authed =
  | {
      type: "user";
      id: number;
    }
  | { type: "service" };

interface AuthOptions {
  user?: boolean;
  service?: boolean;
}

export const jwtUser = jwt({
  name: "jwtUser",
  schema: t.Object({
    id: t.Number(),
  }),
  secret: env.SUPER_SECRET,
});

export function auth(options: AuthOptions = {}) {
  return new Elysia()
    .use(bearer())
    .use(jwtUser)
    .derive({ as: "scoped" }, async ({ headers, bearer, jwtUser }) => {
      let authed: Authed | undefined;

      if (options.user) {
        const token = await jwtUser.verify(bearer);
        if (token) {
          authed = {
            type: "user",
            id: token.id,
          };
        }
      }

      if (options.service) {
        if (headers["x-api-key"] === env.SUPER_SECRET) {
          authed = { type: "service" };
        }
      }

      if (!authed) {
        throw new DeliberateError({ type: "ERR_UNAUTHORIZED" });
      }

      return { authed };
    });
}
