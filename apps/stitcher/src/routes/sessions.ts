import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { validator } from "shared/hono/middleware";
import { z } from "zod";
import { getAppContext } from "../app-context";
import { createMasterUrl } from "../playlist";
import { createSession } from "../session";

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
          z.object({
            time: z.union([z.number(), z.string()]),
            duration: z.number().optional(),
            assets: z
              .array(
                z.object({
                  uri: z.string(),
                }),
              )
              .optional(),
            vast: z
              .object({
                url: z.string(),
              })
              .optional(),
          }),
        )
        .default([]),
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
          url: z.string().optional(),
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
