import { useAuth } from "@/AuthContext";
import { useState, useCallback } from "react";

type Credentials = {
  username: string;
  password: string;
};

export function useLogin() {
  const { setToken, api } = useAuth();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: Credentials) => {
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
