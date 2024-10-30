import { Elysia, t } from "elysia";
import { authUser } from "./token";
import {
  getUser,
  getUserSettings,
  updateUserSettings,
} from "../db/repositories/user-repository";
import { UserSchema, UserSettingsSchema } from "../models";

export const user = new Elysia()
  .use(authUser)
  .get(
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
        200: t.Ref(UserSchema),
      },
    },
  )
  .get(
    "/user/settings",
    async ({ user }) => {
      if (user.type !== "user") {
        throw new Error(`Not a user token , received "${user.type}"`);
      }
      return await getUserSettings(user.id);
    },
    {
      detail: {
        summary: "Get user settings",
        tags: ["User"],
      },
      response: {
        200: t.Ref(UserSettingsSchema),
      },
    },
  )
  .put(
    "/user/settings",
    async ({ user, body }) => {
      if (user.type !== "user") {
        throw new Error(`Not a user token , received "${user.type}"`);
      }
      await updateUserSettings(user.id, body);
      return await getUserSettings(user.id);
    },
    {
      detail: {
        summary: "Update user settings",
        tags: ["User"],
      },
      body: t.Object({
        autoRefresh: t.Optional(t.Boolean()),
      }),
      response: {
        200: t.Ref(UserSettingsSchema),
      },
    },
  );
