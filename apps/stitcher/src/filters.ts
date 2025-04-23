import { z } from "zod";
import type { MasterPlaylist } from "./parser";

export interface Filter {
  resolution?: string;
  audioLanguage?: string;
  textAutoSelect?: "none" | "disabled";
}

export const filterQuerySchema = z
  .string()
  .transform<Filter>((value) => JSON.parse(atob(value)))
  .optional();

export function formatFilterToQueryParam(filter?: Filter) {
  return btoa(JSON.stringify(filter ?? {}));
}

function parseRange(input: string): [number, number] | null {
  const match = input.match(/^(\d+)-(\d+)$/);

  if (match?.[1] && match[2]) {
    const min = Number.parseInt(match[1]);
    const max = Number.parseInt(match[2]);
    return [min, max];
  }

  return null;
}

function parseOperatorToRange(input: string): [number, number] | null {
  const match = input.match(/(<=?|>=?)\s*(\d+)/);
  if (match?.[2] === undefined) {
    return null;
  }

  const operator = match[1];
  const number = Number.parseInt(match[2]);

  if (operator === "<=") {
    return [0, number];
  }
  if (operator === "<") {
    return [0, number - 1];
  }
  if (operator === ">=") {
    return [number, Number.POSITIVE_INFINITY];
  }
  if (operator === ">") {
    return [number + 1, Number.POSITIVE_INFINITY];
  }
  return null;
}

function parseFilterToRange(input: string): [number, number] {
  let range = parseRange(input);
  if (range) {
    return range;
  }

  range = parseOperatorToRange(input);
  if (range) {
    return range;
  }

  throw new Error(`Failed to parse to range "${input}"`);
}

function parseFilterToList(input: string) {
  return input.split(",").map((value) => value.trim());
}

export function filterMasterPlaylist(master: MasterPlaylist, filter: Filter) {
  if (filter.resolution !== undefined) {
    const [min, max] = parseFilterToRange(filter.resolution);
    master.variants = master.variants.filter(
      (variant) =>
        // If we have no height, we'll make it pass.
        !variant.resolution?.height ||
        // If the variant height is within our range.
        (variant.resolution.height >= min && variant.resolution.height <= max),
    );
  }
  if (filter.audioLanguage !== undefined) {
    const list = parseFilterToList(filter.audioLanguage);
    master.renditions = master.renditions.filter((rendition) => {
      if (rendition.type === "AUDIO") {
        if (rendition.language && list.includes(rendition.language)) {
          return true;
        }
        return false;
      }
      return true;
    });
  }
  for (const rendition of master.renditions) {
    if (filter.textAutoSelect && rendition.type === "SUBTITLES") {
      if (filter.textAutoSelect === "disabled") {
        rendition.default = false;
      }
      if (
        filter.textAutoSelect === "disabled" ||
        filter.textAutoSelect === "none"
      ) {
        if (!rendition.default && rendition.autoSelect) {
          rendition.autoSelect = false;
        }
      }
    }
  }
}
