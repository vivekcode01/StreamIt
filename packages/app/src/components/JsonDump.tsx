interface JsonDumpProps {
  data?: string | object;
}

export function JsonDump({ data }: JsonDumpProps) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    data = JSON.parse(data);
  }
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
