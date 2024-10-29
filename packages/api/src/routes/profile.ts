import { Elysia, t } from "elysia";
import { authUser } from "./auth";
import { getUser } from "../db/repo-user";
import { UserSchema } from "../types";

export const profile = new Elysia().use(authUser).get(
  "/profile",
  async ({ user }) => {
    if (user.type !== "user") {
      throw new Error(`Not a user token , received "${user.type}"`);
    }
    return await getUser(user.id);
  },
  {
    detail: {
      summary: "Get your profile",
    },
    response: {
      200: t.Ref(UserSchema),
    },
  },
);
