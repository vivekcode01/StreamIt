import { JsonDump } from "./JsonDump";

interface FilePreviewProps {
  data: {
    url?: string;
    payload?: string;
  };
}

export function FilePreview({ data }: FilePreviewProps) {
  if (data.url) {
    const ext = new URL(data.url).pathname.split(".").pop();
    switch (ext) {
      case "mp4":
      case "m4v":
      case "mkv":
        return <video src={data.url} controls className="w-full" />;
      case "m4a":
        return <audio src={data.url} controls className="w-full" />;
    }
  }

  if (data.payload) {
    if (data.payload.startsWith("{")) {
      return <JsonDump data={data.payload} />;
    }
    return <pre className="text-xs">{data.payload}</pre>;
  }

  return null;
}
