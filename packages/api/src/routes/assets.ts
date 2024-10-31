import { Elysia, t } from "elysia";
import { authUser } from "./token";
import { getAssets } from "../repositories/assets";
import { getGroups } from "../repositories/groups";
import { AssetSchema } from "../types";

export const assets = new Elysia()
  .use(authUser)
  .get(
    "/assets",
    async ({ query }) => {
      const PER_PAGE = 30;
      const assets = await getAssets(query.page, PER_PAGE);
      return {
        page: query.page,
        ...assets,
      };
    },
    {
      detail: {
        summary: "Get all assets",
        tags: ["Assets"],
      },
      query: t.Object({
        page: t.Number({ default: 1 }),
      }),
      response: {
        200: t.Object({
          page: t.Number(),
          totalPages: t.Number(),
          rows: t.Array(AssetSchema),
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
