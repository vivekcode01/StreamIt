import { Storage } from "@/components/Storage";
import { useSearchParams } from "react-router-dom";

export function StoragePage() {
  const [searchParams] = useSearchParams();
  let path = searchParams.get("path");

  if (!path) {
    path = "/";
  }

  return <Storage path={path} />;
}
