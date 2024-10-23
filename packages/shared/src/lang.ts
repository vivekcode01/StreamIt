import { by639_2T } from "iso-language-codes";
import type { LangCode } from "./typebox";

export type { LangCode } from "./typebox";

export function getLangCode(value?: string) {
  if (value && value in by639_2T) {
    return value as LangCode;
  }
  return null;
}
