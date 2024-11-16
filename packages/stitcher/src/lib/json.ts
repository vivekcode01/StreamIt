import { DateTime } from "luxon";
import { assert } from "shared/assert";
import { parse, registerCustom, stringify } from "superjson";
import { Group } from "./group";

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

registerCustom<Group, string>(
  {
    isApplicable: (value) => value instanceof Group,
    serialize: (group) => stringify(group.map),
    deserialize: (value) => new Group(parse(value)),
  },
  "Group",
);

export const JSON = {
  parse,
  stringify,
};
