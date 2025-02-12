import { createContext, useContext, useEffect } from "react";
import { flushSync } from "react-dom";
import useLocalStorageState from "use-local-storage-state";
import { api } from "./api";
import type { ReactNode } from "react";

export interface AuthContext {
  signIn(username: string, password: string): Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useLocalStorageState<string | null>("token", {
    defaultValue: null,
  });

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  const signIn = async (username: string, password: string) => {
    const response = await api.client.token.$post({
      json: { username, password },
    });
    const { token } = await response.json();
    flushSync(() => setToken(token));
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        token,
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
