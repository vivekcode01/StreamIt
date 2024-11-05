interface JsonDumpProps {
  data?: string | object;
}

export function JsonDump({ data }: JsonDumpProps) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
