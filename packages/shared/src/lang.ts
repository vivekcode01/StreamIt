import { by639_2T } from "iso-language-codes";

export function getLangCode(value?: string) {
  if (value && value in by639_2T) {
    return value;
  }
  return null;
}
