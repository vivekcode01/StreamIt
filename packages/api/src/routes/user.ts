import { Elysia } from "elysia";
import { authUser } from "../auth";
import { getUser } from "../repositories/users";
import { UserSchema } from "../types";

export const user = new Elysia().use(authUser).get(
  "/user",
  async ({ user }) => {
    return await getUser(user.id);
  },
  {
    detail: {
      summary: "Get authenticated user",
      tags: ["User"],
    },
    response: {
      200: UserSchema,
    },
  },
);
