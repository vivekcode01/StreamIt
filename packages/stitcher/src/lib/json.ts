import { DateTime } from "luxon";
import { parse, registerCustom, stringify } from "superjson";

registerCustom<DateTime, string>(
  {
    isApplicable: (value) => DateTime.isDateTime(value),
    serialize: (dateTime) => {
      const dateTimeISO = dateTime.toISO();
      if (!dateTimeISO) {
        throw new Error("Failed to serialize DateTime");
      }
      return dateTimeISO;
    },
    deserialize: (value) => DateTime.fromISO(value),
  },
  "DateTime",
);

export const JSON = {
  parse,
  stringify,
};
