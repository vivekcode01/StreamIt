import { Elysia, t } from "elysia";
import { authUser } from "./token";
import { getAssets, getGroups } from "../repositories/assets";
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

      query: t.Object({
        page: t.Number(),
        perPage: t.Number(),
        sortKey: t.Union([
          t.Literal("name"),
          t.Literal("playables"),
          t.Literal("createdAt"),
        ]),
        sortDir: t.Union([t.Literal("asc"), t.Literal("desc")]),
      }),
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
