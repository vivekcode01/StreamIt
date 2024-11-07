import { Elysia, t } from "elysia";
import { authUserJwt } from "../auth";
import { DeliberateError } from "../errors";
import { getUserIdByCredentials } from "../repositories/users";

export const token = new Elysia().use(authUserJwt).post(
  "/token",
  async ({ authUserJwt, body }) => {
    const id = await getUserIdByCredentials(body.username, body.password);
    if (id === null) {
      throw new DeliberateError({ type: "ERR_USER_INVALID_CREDENTIALS" });
    }
    return await authUserJwt.sign({
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
