import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { Navigate } from "react-router-dom";
import { api } from "./api";
import type { ReactNode } from "react";

type User = {
  id: number;
  username: string;
};

type AuthValue =
  | {
      token: null;
      error: boolean;
      loading: boolean;
      login(credentials: Credentials): void;
    }
  | {
      token: string;
      user: User;
    };

export const AuthContext = createContext<AuthValue>({} as AuthValue);

type AuthProviderProps = {
  children: ReactNode;
};

type Credentials = {
  username: string;
  password: string;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: Credentials) => {
    setError(false);
    setLoading(true);

    const result = await api.auth.index.post(credentials);

    if (result.status === 200 && result.data) {
      setToken(result.data.token);
      setUser(result.data.user);
    } else {
      setError(true);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => {
    return token && user
      ? { token, user }
      : {
          token: null,
          error,
          loading,
          login,
        };
  }, [token, user, login, error, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const data = useContext(AuthContext);
  if (!data.token) {
    throw new Error("Missing token");
  }
  return data.user;
}

function Auth(props: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  return token ? props.children : <Navigate to="/login" />;
}

export function auth(component: ReactNode) {
  return <Auth>{component}</Auth>;
}
