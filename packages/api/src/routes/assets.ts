import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { auth } from "../middleware";
import {
  getAsset,
  getAssets,
  getGroups,
  updateAsset,
} from "../repositories/assets";
import {
  getAssetResponseSchema,
  getAssetsResponseSchema,
  getGroupsResponseSchema,
} from "../schemas/assets";
import { validator } from "../validator";

export const assetsApp = new Hono()
  .use(auth())
  .get(
    "/",
    describeRoute({
      summary: "Get all assets",
      security: [{ userToken: [] }],
      tags: ["Assets"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(getAssetsResponseSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        page: z.coerce.number().default(1),
        perPage: z.coerce.number().default(20),
        sortKey: z
          .enum(["name", "playables", "groupId", "createdAt"])
          .default("createdAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      }),
    ),
    async (c) => {
      const { page, perPage, sortKey, sortDir } = c.req.valid("query");
      const assets = await getAssets({
        page,
        perPage,
        sortKey,
        sortDir,
      });
      return c.json(assets);
    },
  )
  .get(
    "/groups",
    describeRoute({
      summary: "Get all asset groups",
      security: [{ userToken: [] }],
      tags: ["Assets"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(getGroupsResponseSchema),
            },
          },
        },
      },
    }),
    async (c) => {
      const groups = await getGroups();
      return c.json(groups, 200);
    },
  )
  .get(
    "/:id",
    describeRoute({
      summary: "Get an asset",
      security: [{ userToken: [] }],
      tags: ["Assets"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(getAssetResponseSchema),
            },
          },
        },
      },
    }),
    validator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const job = await getAsset(id);
      return c.json(job, 200);
    },
  )
  .put(
    "/:id",
    describeRoute({
      summary: "Update an asset",
      security: [{ userToken: [] }],
      tags: ["Assets"],
      responses: {
        200: {
          description: "Successful response",
        },
      },
    }),
    validator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    validator(
      "json",
      z.object({
        name: z.string(),
      }),
    ),
    async (c) => {
      const params = c.req.valid("param");
      const body = c.req.valid("json");
      await updateAsset(params.id, body);
      return c.status(200);
    },
  );
