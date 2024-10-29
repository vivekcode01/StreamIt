import { useState, createContext, useContext, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { createApiClient } from "@superstreamer/api/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { User } from "@superstreamer/api/client";

type AuthContextValue = {
  token: string | null;
  setToken(value: string | null): void;
  user: User | null;
  api: ReturnType<typeof createApiClient>;
};

export const AuthContext = createContext<AuthContextValue>(
  {} as AuthContextValue,
);

type AuthProviderProps = {
  children: ReactNode;
};

const LOCAL_STORAGE_KEY = "sprsToken";

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(LOCAL_STORAGE_KEY),
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [token]);

  const api = useMemo(() => {
    return createApiClient(window.__ENV__.PUBLIC_API_ENDPOINT, token);
  }, [token]);

  const { data: user } = useSuspenseQuery({
    queryKey: ["profile", token],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      const result = await api.profile.get();
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

export function useAuth() {
  return useContext(AuthContext);
}

export function useUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("Not authenticated when calling useUser");
  }
  return user;
}

export function Auth(props: { children: ReactNode }) {
  const { user } = useContext(AuthContext);
  return user ? props.children : <Navigate to="/login" />;
}

export function Guest(props: { children: ReactNode }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/" /> : props.children;
}
