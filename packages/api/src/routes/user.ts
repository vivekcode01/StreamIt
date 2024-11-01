import { Elysia, t } from "elysia";
import { authUser } from "./token";
import { DeliberateError } from "../errors";
import {
  getUser,
  getUserSettings,
  updateUserSettings,
} from "../repositories/users";
import { UserSchema, UserSettingsSchema } from "../types";

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
        200: UserSchema,
      },
    },
  )
  .get(
    "/user/settings",
    async ({ user }) => {
      if (user.type !== "user") {
        throw new DeliberateError({
          type: "ERR_USER_INVALID_TOKEN_TYPE",
          data: { only: "user" },
        });
      }
      return await getUserSettings(user.id);
    },
    {
      detail: {
        summary: "Get user settings",
        tags: ["User"],
      },
      response: {
        200: UserSettingsSchema,
      },
    },
  )
  .put(
    "/user/settings",
    async ({ user, body }) => {
      if (user.type !== "user") {
        throw new DeliberateError({
          type: "ERR_USER_INVALID_TOKEN_TYPE",
          data: { only: "user" },
        });
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
        200: UserSettingsSchema,
      },
    },
  );
