interface DataDumpProps {
  data?: string | object;
}

export function DataDump({ data }: DataDumpProps) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    data = data.trim();
    if (data.startsWith("{")) {
      data = JSON.parse(data);
    }
  }

  if (typeof data === "object") {
    data = JSON.stringify(data, null, 2);
  }

  return <pre className="text-xs whitespace-pre-wrap">{data}</pre>;
}
