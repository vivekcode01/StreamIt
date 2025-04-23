import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { auth } from "../middleware";
import {
  getAsset,
  getAssets,
  getGroups,
  updateAsset,
} from "../repositories/assets";
import {
  assetSchema,
  assetsPaginatedSchema,
  groupsSchema,
} from "../schemas/assets";

export const assetsApp = new Hono()
  .use(auth())

  /**
   * Get a list of assets.
   */
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
              schema: resolver(assetsPaginatedSchema),
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
        query: z.string().default(""),
      }),
    ),
    async (c) => {
      const filter = c.req.valid("query");
      const { items, totalPages } = await getAssets(filter);
      return c.json({
        filter,
        items,
        totalPages,
      });
    },
  )

  /**
   * Get a list of groups.
   */
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
              schema: resolver(groupsSchema),
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

  /**
   * Get an asset.
   */
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
              schema: resolver(assetSchema),
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

  /**
   * Update an asset by id.
   */
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
