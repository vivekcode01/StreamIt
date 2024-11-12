import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { DeliberateError } from "../errors";
import {
  assetsFilterSchema,
  getAsset,
  getAssets,
  getGroups,
} from "../repositories/assets";
import { AssetSchema } from "../types";

export const assets = new Elysia()
  .use(auth({ user: true, service: true }))
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
    "/assets/:id",
    async ({ params }) => {
      const asset = await getAsset(params.id);
      if (!asset) {
        throw new DeliberateError({ type: "ERR_NOT_FOUND" });
      }
      return asset;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Get an asset by id",
        tags: ["Assets"],
      },
      response: {
        200: AssetSchema,
        400: t.Never(),
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
