import { useAuth } from "@/AuthContext";
import { useCallback } from "react";

export function useLogout() {
  const { setToken } = useAuth();

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return logout;
}
