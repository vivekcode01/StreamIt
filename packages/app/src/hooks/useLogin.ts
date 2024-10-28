import { useApi } from "@/ApiContext";
import { useAuth } from "@/AuthContext";
import { useState, useCallback } from "react";

type Credentials = {
  username: string;
  password: string;
};

export function useLogin() {
  const { setToken } = useAuth();
  const api = useApi();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: Credentials) => {
    setError(false);
    setLoading(true);

    const result = await api.login.post(credentials);

    if (result.status === 200 && result.data) {
      setToken(result.data.token);
    } else {
      setError(true);
    }

    setLoading(false);
  }, []);

  return { login, error, loading };
}
