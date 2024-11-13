import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { DeliberateError } from "../errors";
import { getAsset, getAssets, getGroups } from "../repositories/assets";
import { AssetSchema } from "../types";
import { mergeProps } from "../utils/type-guard";

export const assets = new Elysia()
  .use(auth({ user: true, service: true }))
  .get(
    "/assets",
    async ({ query }) => {
      const filter = mergeProps(query, {
        page: 1,
        perPage: 20,
        sortKey: "createdAt",
        sortDir: "desc",
      });
      return await getAssets(filter);
    },
    {
      detail: {
        summary: "Get all assets",
        tags: ["Assets"],
      },
      query: t.Object({
        page: t.Optional(t.Number()),
        perPage: t.Optional(t.Number()),
        sortKey: t.Optional(
          t.Union([
            t.Literal("name"),
            t.Literal("playables"),
            t.Literal("groupId"),
            t.Literal("createdAt"),
          ]),
        ),
        sortDir: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
      }),
      response: {
        200: t.Object({
          page: t.Number(),
          perPage: t.Number(),
          sortKey: t.Union([
            t.Literal("name"),
            t.Literal("playables"),
            t.Literal("groupId"),
            t.Literal("createdAt"),
          ]),
          sortDir: t.Union([t.Literal("asc"), t.Literal("desc")]),
          items: t.Array(AssetSchema),
          totalPages: t.Number(),
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
