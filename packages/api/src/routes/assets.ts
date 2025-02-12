import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { auth } from "../middleware";
import { getAssets, updateAsset } from "../repositories/assets";
import { validator } from "../validator";

const assetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  groupId: z.number().nullable(),
  createdAt: z.date(),
  playables: z.number(),
});

const assetsFilterSchema = z.object({
  page: z.number().default(1),
  perPage: z.number().default(20),
  sortKey: z
    .enum(["name", "playables", "groupId", "createdAt"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

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
              schema: resolver(
                z.intersection(
                  assetsFilterSchema,
                  z.object({
                    items: z.array(assetSchema),
                    totalPages: z.number(),
                  }),
                ),
              ),
            },
          },
        },
      },
    }),
    validator("query", assetsFilterSchema),
    async (c) => {
      const query = c.req.valid("query");
      const assets = await getAssets(query);
      return c.json(assets);
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
