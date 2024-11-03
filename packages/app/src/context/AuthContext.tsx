/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { createApiClient } from "@superstreamer/api/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useEffect, useMemo, useState } from "react";
import type { ApiClient, User } from "@superstreamer/api/client";
import type { ReactNode } from "react";

interface AuthContextValue {
  token: string | null;
  setToken(value: string | null): void;
  user: User | null;
  api: ApiClient;
}

export const AuthContext = createContext<AuthContextValue>(
  {} as AuthContextValue,
);

interface AuthProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = "sprsToken";

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY),
  );

  const api = useMemo(
    () => createApiClient(window.__ENV__.PUBLIC_API_ENDPOINT, { token }),
    [token],
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [token]);

  const { data: user } = useSuspenseQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      const result = await api.user.get();
      if (result.status === 401) {
        return null;
      }
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  if (token && !user) {
    // We've got a token, no user, thus token is invalid.
    setToken(null);
  }

  const value = useMemo(() => {
    return {
      token,
      setToken,
      user,
      api,
    };
  }, [token, setToken, user, api]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
