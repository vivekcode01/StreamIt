import JsTimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import prettyBytes from "pretty-bytes";
import prettyMs from "pretty-ms";

JsTimeAgo.addDefaultLocale(en);

const timeAgo = new JsTimeAgo("en-US");

type FormatProps = { className?: string } & (
  | { format: "date"; value?: Date | number | null }
  | { format: "size"; value?: number | null }
  | { format: "duration"; value?: number | null }
  | { format: "short-id"; value?: string | null }
);

export function Format({ className, format, value }: FormatProps) {
  if (value === undefined || value === null) {
    return null;
  }

  let str: string | undefined;
  if (format === "date") {
    str = timeAgo.format(new Date(value));
  }
  if (format === "size") {
    str = prettyBytes(value);
  }
  if (format === "duration") {
    str = prettyMs(Math.trunc(value / 1000) * 1000, {});
  }
  if (format === "short-id") {
    // The format is queue_uuid(_name), the latter is custom for each job.
    const chunks = value.split("_", 3);
    str = chunks[1].substring(0, 7);
  }

  return str ? <span className={className}>{str}</span> : null;
}
