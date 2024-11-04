import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthCredentials {
  username: string;
  password: string;
}

export function useAuthLogin() {
  const { api, setToken } = useAuth();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setError(false);
    setLoading(true);

    const result = await api.token.post(credentials);

    if (result.status === 200 && result.data) {
      setToken(result.data);
    } else {
      setError(true);
    }

    setLoading(false);
  }, []);

  return { login, error, loading };
}
