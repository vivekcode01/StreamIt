import { useCallback } from "react";
import { useAuth } from "@/AuthContext";

export function useLogout() {
  const { setToken } = useAuth();

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return logout;
}
