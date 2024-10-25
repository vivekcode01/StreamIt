import { getSchemaValidator } from "elysia";
import type { Static, TSchema } from "elysia";

export function validateWithSchema<T extends TSchema>(
  schema: T,
  value: unknown,
): Static<T> {
  const validator = getSchemaValidator(schema);
  if ("parse" in validator && typeof validator.parse === "function") {
    return validator.parse(value);
  }
  throw new Error("Failed to parse schema, parse method missing");
}
