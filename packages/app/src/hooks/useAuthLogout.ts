import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useAuthLogout() {
  const { setToken } = useAuth();

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return logout;
}
