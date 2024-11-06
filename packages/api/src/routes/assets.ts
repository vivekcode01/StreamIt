import { Elysia, t } from "elysia";
import { authUser } from "./token";
import {
  assetsFilterSchema,
  getAssets,
  getGroups,
} from "../repositories/assets";
import { AssetSchema } from "../types";

export const assets = new Elysia()
  .use(authUser)
  .get(
    "/assets",
    async ({ query }) => {
      return await getAssets(query);
    },
    {
      detail: {
        summary: "Get all assets",
        tags: ["Assets"],
      },

      query: assetsFilterSchema,
      response: {
        200: t.Object({
          totalPages: t.Number(),
          items: t.Array(AssetSchema),
        }),
      },
    },
  )
  .get(
    "/groups",
    async () => {
      return await getGroups();
    },
    {
      detail: {
        summary: "Get all groups",
        tags: ["Assets"],
      },
    },
  );
