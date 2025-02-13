import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { auth } from "../middleware";
import { getUser } from "../repositories/users";
import { userSchema } from "../schemas/user";
import type { AuthVariables } from "../middleware";

export const userApp = new Hono<{
  Variables: AuthVariables;
}>()
  .use(auth())

  /**
   * Get authenticated user.
   */
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
              schema: resolver(userSchema),
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
