interface DataViewProps {
  data: object | string;
  redacted?: string[];
}

type Value = string | number | null | undefined | object;

export function DataView({ data, redacted }: DataViewProps) {
  if (typeof data === "string") {
    if (data.trim().startsWith("{")) {
      data = JSON.parse(data);
    } else {
      return <pre className="text-xs font-mono">{data}</pre>;
    }
  }

  return (
    <div className="text-xs font-mono -ml-3">
      <Value name="" parent="" value={data} redacted={redacted} depth={0} />
    </div>
  );
}

function Value({
  name,
  value,
  parent,
  redacted,
  depth,
}: {
  name: string;
  value: Value | Value[];
  parent: string;
  redacted?: string[];
  depth: number;
}) {
  const path = [parent, name].filter((item) => !!item).join(".");

  if (redacted?.some((lookup) => matchRedacted(lookup, path))) {
    return null;
  }

  if (Array.isArray(value)) {
    return (
      <IteratedValue
        name={name}
        values={value.map((child, index) => [index.toString(), child])}
        parent={path}
        redacted={redacted}
        isArray
        depth={depth}
      />
    );
  }
  if (typeof value === "object" && value) {
    const values = Object.entries(value);

    values.sort((a, b) => (a[0] > b[0] ? 1 : -1));

    return (
      <IteratedValue
        name={name}
        values={values}
        parent={path}
        redacted={redacted}
        depth={depth}
      />
    );
  }
  if (value !== Object(value)) {
    return (
      <div className="ml-3" data-key={path}>
        {name}: <Primitive value={value} />
      </div>
    );
  }
  return null;
}

function IteratedValue({
  name,
  values,
  parent,
  isArray,
  redacted,
  depth,
}: {
  name: string;
  values: [string, Value][];
  parent: string;
  isArray?: boolean;
  redacted?: string[];
  depth: number;
}) {
  return (
    <div className="ml-3">
      {name ? `${name}: ` : ""}{" "}
      {isArray ? (
        <span className="text-lime-700">{"["}</span>
      ) : (
        <span className="text-blue-700">{"{"}</span>
      )}
      {values.map(([childName, child]) => {
        return (
          <Value
            key={`${parent}.${childName}`}
            name={childName}
            value={child}
            parent={parent}
            redacted={redacted}
            depth={depth}
          />
        );
      })}
      {isArray ? (
        <span className="text-lime-700">{"]"}</span>
      ) : (
        <span className="text-blue-700">{"}"}</span>
      )}
    </div>
  );
}

function Primitive({ value }: { value: Value }) {
  const str = String(value);
  if (value === null || value === undefined) {
    return <span className="opacity-50">{str}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-blue-700">"{str}"</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-amber-600">{str}</span>;
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return <span className="opacity-50">{str}</span>;
    }
    return <span className="text-pink-600">{str}</span>;
  }
  return str;
}

function matchRedacted(wildcard: string, str: string) {
  const lookup = wildcard.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${lookup.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
    "i",
  ).test(str);
}
