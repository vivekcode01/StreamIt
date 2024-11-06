import { Elysia } from "elysia";
import { authUser } from "./token";
import { getUser } from "../repositories/users";
import { UserSchema } from "../types";

export const user = new Elysia().use(authUser).get(
  "/user",
  async ({ user }) => {
    if (user.type !== "user") {
      throw new Error(`Not a user token , received "${user.type}"`);
    }
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
