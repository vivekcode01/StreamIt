import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { apiError } from "../errors";
import { auth } from "../middleware";
import type { AuthVariables } from "../middleware";
import { getUser } from "../repositories/users";
import { userSchema } from "../schemas/user";

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
      const userData = c.get("user");
      if (userData.role !== "user") {
        throw apiError("ERR_AUTH_INVALID_ROLE");
      }
      const user = await getUser(userData.id);
      return c.json(user, 200);
    },
  );
