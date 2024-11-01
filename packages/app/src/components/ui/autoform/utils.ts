import { buildZodFieldConfig } from "@autoform/react";
import type { FieldTypes } from "./AutoForm";

export const fieldConfig = buildZodFieldConfig<
  FieldTypes,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {
    // Add types for `customData` here.
  }
>();
