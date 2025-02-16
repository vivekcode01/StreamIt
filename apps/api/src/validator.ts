/* eslint-disable @typescript-eslint/no-explicit-any */

import { validator as zValidator } from "hono-openapi/zod";
import type { ValidationTargets } from "hono";
import type { ZodSchema, ZodTypeDef } from "zod";

export const validator = <
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
        },
        400,
      );
    }
  });
};
