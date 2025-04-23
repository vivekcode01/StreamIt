import { DateTime } from "luxon";
import { parse, registerCustom, stringify } from "superjson";
import { assert } from "../assert";

registerCustom<DateTime, string>(
  {
    isApplicable: (value) => DateTime.isDateTime(value),
    serialize: (dateTime) => {
      const value = dateTime.toISO();
      assert(value, "No convert to ISO");
      return value;
    },
    deserialize: (value) => DateTime.fromISO(value),
  },
  "DateTime",
);

export const SuperJSON = {
  parse,
  stringify,
};
