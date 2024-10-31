import { Elysia, t } from "elysia";
import { authUser } from "./token";
import { getAssets, getAssetsCount } from "../repositories/assets";
import { getGroups } from "../repositories/groups";
import { AssetSchema } from "../types";

export const assets = new Elysia()
  .use(authUser)
  .get(
    "/assets",
    async ({ query }) => {
      const assets = await getAssets(query);

      const count = await getAssetsCount();
      const totalPages = Math.ceil(count / query.perPage);

      return {
        page: query.page,
        totalPages,
        assets,
      };
    },
    {
      detail: {
        summary: "Get all assets",
        tags: ["Assets"],
      },

      query: t.Object({
        page: t.Number(),
        perPage: t.Number(),
        orderBy: t.String(),
        direction: t.String(),
      }),
      response: {
        200: t.Object({
          page: t.Number(),
          totalPages: t.Number(),
          assets: t.Array(AssetSchema),
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
