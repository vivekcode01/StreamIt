import { useEffect } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export function useAutoRefreshFunction(listener: () => void) {
  const { add } = useAutoRefresh();

  useEffect(() => {
    return add(listener);
  }, [add]);
}
