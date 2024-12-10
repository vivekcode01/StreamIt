import type { ReactNode } from "react";

type Data = string | number | object | null | undefined;

interface DataDump2Props {
  data: object;
  parent?: string;
}

export function DataDump2({
  name,
  data,
  parent,
  redacted,
}: {
  name?: string | number;
  data: Data | Data[];
  parent?: string;
  redacted?: string[];
}) {
  const id = `${parent}.${name}`;

  for (const check of redacted ?? []) {
    if (id.includes(check)) {
      return null;
    }
  }

  if (Array.isArray(data)) {
    return (
      <div className="ml-2">
        <Label name={name} />
        {"["}
        {data.map((child, index) => (
          <DataDump2
            key={`${id}.${index}`}
            parent={`${id}.${index}`}
            name={index}
            data={child}
            redacted={redacted}
          />
        ))}
        {"]"}
      </div>
    );
  }
  if (typeof data === "object" && data) {
    return (
      <div className="ml-2">
        <Label name={name} />
        {"{"}
        {Object.entries(data).map(([name, value]) => {
          return (
            <DataDump2
              key={`${id}.${name}`}
              parent={`${id}.${name}`}
              name={name}
              data={value}
              redacted={redacted}
            />
          );
        })}
        {"}"}
      </div>
    );
  }
  if (data !== Object(data)) {
    return <Primitive name={name ?? ""} value={data} />;
  }
  return null;
}

export function DataDump2_({ data }: DataDump2Props) {
  return (
    <div className="text-sm">
      <Tree data={data} />
    </div>
  );
}

function Tree({ data, parent = "" }: { data: object; parent?: string }) {
  return Object.entries(data).map(([name, value]) => {
    const id = `${parent}.${name}`;

    if (id.includes("levels") || id.includes(".track")) {
      return null;
    }

    if (value !== Object(value)) {
      return <Primitive key={id} name={name} value={value} />;
    }

    if (Array.isArray(value)) {
      return (
        <div key={id} className="ml-2">
          <Label name={name} />
          {"["}
          {value.map((child, index) => (
            <Tree key={`${id}.${index}`} parent={id} data={child} />
          ))}
          {"]"}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div key={id} className="ml-2">
          <Label name={name} />
          {"{"}
          <Tree parent={id} data={value} />
          {"}"}
        </div>
      );
    }

    return null;
  });
}

function Primitive({ name, value }: { name: string | number; value: Data }) {
  let className = "";
  let child: ReactNode = String(value);
  if (value === undefined || value === null) {
    className = "opacity-50";
  } else if (typeof value === "number") {
    if (Number.isNaN(value)) {
      className = "text-red-500";
    } else if (Number.isInteger(value)) {
      className = "text-blue-700";
    } else {
      className = "text-pink-700";
    }
  } else if (typeof value === "string") {
    className = "text-purple-500";
    child = `"${value}"`;
  } else if (typeof value === "boolean") {
    className = "text-amber-600";
  }

  return (
    <div className="ml-2">
      <Label name={name.toString()} />
      <span className={className}>{child}</span>
    </div>
  );
}

function Label({ name }: { name?: string | number }) {
  if (name === undefined) {
    return "";
  }
  return (
    <>
      <span className="opacity-70">{name}</span>:{" "}
    </>
  );
}
