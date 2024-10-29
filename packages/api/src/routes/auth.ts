import { Elysia, t } from "elysia";
import { env } from "../env";
import { getUserIdByCredentials } from "../db/repo-user";
import { bearerAuth } from "shared/auth";

const { user, jwtUser } = bearerAuth(env.JWT_SECRET);

export const auth = new Elysia().use(jwtUser).post(
  "/login",
  async ({ jwtUser, body, set }) => {
    const id = await getUserIdByCredentials(body.username, body.password);
    if (id === null) {
      set.status = 400;
      return "Unauthorized";
    }
    return {
      token: await jwtUser.sign({
        type: "user",
        id,
      }),
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

// Re-export these so we can consume them in other routes.
export { user, jwtUser };
