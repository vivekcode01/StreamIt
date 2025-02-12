import { Elysia } from "elysia";
import { auth } from "../auth";
import { getUser } from "../repositories/users";
import { UserSchema } from "../types";

export const user = new Elysia().use(auth({ user: true })).get(
  "/user",
  async ({ authed }) => {
    if (authed.type !== "user") {
      throw new Error("Invalid authed");
    }
    return await getUser(authed.id);
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
