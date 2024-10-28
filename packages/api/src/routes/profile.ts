import { Elysia, t } from "elysia";
import { authUser } from "./auth";
import { getUser } from "../db/repo-user";
import { UserSchema } from "../types";

export const profile = new Elysia().use(authUser).get(
  "/profile",
  async ({ userId }) => {
    return await getUser(userId);
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
