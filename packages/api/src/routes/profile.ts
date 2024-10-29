import { Elysia, t } from "elysia";
import { user } from "./auth";
import { getUser, updateUser } from "../db/repo-user";
import { UserSchema } from "../types";

export const profile = new Elysia()
  .use(user)
  .get(
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
  )
  .put(
    "/profile",
    async ({ user, body }) => {
      if (user.type !== "user") {
        throw new Error(`Not a user token , received "${user.type}"`);
      }
      await updateUser(user.id, body);
    },
    {
      body: t.Object({
        settingAutoRefetch: t.Optional(t.Boolean()),
      }),
    },
  );
