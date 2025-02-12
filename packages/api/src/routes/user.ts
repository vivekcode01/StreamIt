import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { auth } from "../middleware";
import { getUser } from "../repositories/users";
import type { AuthVariables } from "../middleware";

export const userApp = new Hono<{
  Variables: AuthVariables;
}>()
  .use(auth())
  .get(
    "/",
    describeRoute({
      summary: "Get authenticated user",
      description: "Get the current user",
      security: [{ userToken: [] }],
      tags: ["User"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  id: z.number(),
                  username: z.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const { id } = c.get("user");
      const user = await getUser(id);
      return c.json(user, 200);
    },
  );
