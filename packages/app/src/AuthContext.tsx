import { useState, createContext, useContext, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ShortCrypt } from "short-crypt";
import type { ReactNode } from "react";

type AuthContextValue = {
  token: string | null;
  setToken(value: string | null): void;
};

export const AuthContext = createContext<AuthContextValue>(
  {} as AuthContextValue,
);

const sc = new ShortCrypt("superstreamer");

type AuthProviderProps = {
  children: ReactNode;
};

const LOCAL_STORAGE_KEY = "sprsToken";

function getInitialToken() {
  // We know this isn't "security", but it's nice not to be able to directly correlate a
  // locally stored value on plain sight.
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);
  const value = token ? sc.decryptURLComponent(token) : null;
  return value ? new TextDecoder().decode(value) : null;
}

function saveToken(value: string) {
  const wrapToken = sc.encryptToURLComponent(value);
  localStorage.setItem(LOCAL_STORAGE_KEY, wrapToken);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(getInitialToken);

  useEffect(() => {
    if (token) {
      saveToken(token);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [token]);

  const value = useMemo(() => {
    return {
      token,
      setToken,
    };
  }, [token, setToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function Auth(props: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  return token ? props.children : <Navigate to="/login" />;
}

export function Guest(props: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" /> : props.children;
}
