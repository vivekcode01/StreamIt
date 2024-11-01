import { useSearchParams } from "react-router-dom";
import { Storage } from "@/components/Storage";

export function StoragePage() {
  const [searchParams] = useSearchParams();
  let path = searchParams.get("path");

  if (!path) {
    path = "/";
  }

  return <Storage path={path} />;
}
