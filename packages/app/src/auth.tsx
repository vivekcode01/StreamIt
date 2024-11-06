import { createApiClient } from "@superstreamer/api/client";
import { createContext, useContext, useMemo } from "react";
import { flushSync } from "react-dom";
import useLocalStorageState from "use-local-storage-state";
import type { ApiClient } from "@superstreamer/api/client";
import type { ReactNode } from "react";

export interface AuthContext {
  signIn(username: string, password: string): Promise<void>;
  token: string | null;
  api: ApiClient;
}

const AuthContext = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useLocalStorageState<string | null>("token", {
    defaultValue: null,
  });

  const api = useMemo(() => {
    return createApiClient(
      window.__ENV__.PUBLIC_API_ENDPOINT,
      token ? { token } : undefined,
    );
  }, [token]);

  const signIn = async (username: string, password: string) => {
    const { data } = await api.token.post({ username, password });
    flushSync(() => setToken(data));
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        token,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
