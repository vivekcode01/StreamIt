import { validator as zValidator } from "hono-openapi/zod";
import type { ValidationTargets } from "hono";
import type { ZodSchema, ZodTypeDef } from "zod";

export const validator = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ZodSchema<any, ZodTypeDef, any>,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: "ERR_VALIDATION",
          errors: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }
  });
};
