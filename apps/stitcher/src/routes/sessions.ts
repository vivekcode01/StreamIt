import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { getAppContext } from "../app-context";
import { createMasterUrl } from "../playlist";
import { createSession } from "../session";
import { validator } from "../validator";

export const sessionsApp = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a session",
    tags: ["Sessions"],
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                url: z.string(),
              }),
            ),
          },
        },
      },
    },
  }),
  validator(
    "json",
    z.object({
      uri: z.string(),
      interstitials: z
        .array(
          z.intersection(
            z.object({
              time: z.union([z.number(), z.string()]),
            }),
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("asset"),
                uri: z.string(),
              }),
              z.object({
                type: z.literal("vast"),
                url: z.string(),
              }),
            ]),
          ),
        )
        .optional(),
      regions: z
        .array(
          z.object({
            time: z.union([z.number(), z.string()]),
            inlineDuration: z.number().optional(),
          }),
        )
        .optional(),
      filter: z
        .object({
          resolution: z.string().optional(),
          audioLanguage: z.string().optional(),
        })
        .optional(),
      vmap: z
        .object({
          url: z.string(),
        })
        .optional(),
      vast: z
        .object({
          url: z.string(),
        })
        .optional(),
      expiry: z.number().default(60 * 60 * 12),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");

    const context = await getAppContext(c);

    const session = await createSession(context, body);

    const url = createMasterUrl(context, session, session.url, body.filter);

    return c.json({ url }, 200);
  },
);
