import { useContext } from "react";
import { AutoRefreshContext } from "@/context/AutoRefreshContext";

export function useAutoRefresh() {
  return useContext(AutoRefreshContext);
}
