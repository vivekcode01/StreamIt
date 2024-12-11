interface DataViewProps {
  data: object | string;
}

type Value = string | number | null | undefined | object;

export function DataView({ data }: DataViewProps) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  return (
    <div className="text-xs">
      <Value name="" parent="" value={data} />
    </div>
  );
}

function Value({
  name,
  value,
  parent,
}: {
  name: string;
  value: Value | Value[];
  parent: string;
}) {
  const path = [parent, name].filter((item) => !!item).join(".");

  if (Array.isArray(value)) {
    return (
      <IteratedValue
        name={name}
        values={value.map((child, index) => [index.toString(), child])}
        parent={path}
        isArray
      />
    );
  }
  if (typeof value === "object" && value) {
    return (
      <IteratedValue name={name} values={Object.entries(value)} parent={path} />
    );
  }
  if (value !== Object(value)) {
    return (
      <div className="ml-2" data-key={path}>
        {name}: {String(value)}
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
}: {
  name: string;
  values: [string, Value][];
  parent: string;
  isArray?: boolean;
}) {
  return (
    <div className="ml-2">
      {name ? `${name}: ` : ""} {isArray ? "[" : "{"}
      {values.map(([childName, child]) => {
        return (
          <Value
            key={`${parent}.${childName}`}
            name={childName}
            value={child}
            parent={parent}
          />
        );
      })}
      {isArray ? "]" : "}"}
    </div>
  );
}
