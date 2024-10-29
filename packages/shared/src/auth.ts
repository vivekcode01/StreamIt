import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import type { Static } from "elysia";

const userSchema = t.Union([
  // User tokens describe a user interacting with the API.
  t.Object({
    type: t.Literal("user"),
    id: t.Number(),
  }),
  // Service tokens, such as Stitcher.
  t.Object({ type: t.Literal("service") }),
]);

export type User = Static<typeof userSchema>;

export function bearerAuth(secret: string) {
  const jwtUser = jwt({
    name: "jwtUser",
    schema: userSchema,
    secret,
  });

  const user = new Elysia()
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

  return {
    jwtUser,
    user,
  };
}
