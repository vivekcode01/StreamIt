import { createContext, useContext } from "react";
import useLocalStorageState from "use-local-storage-state";
import type { ReactNode } from "react";

export interface AuthContext {
  setToken(token: string | null): void;
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

  return (
    <AuthContext.Provider
      value={{
        setToken,
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
