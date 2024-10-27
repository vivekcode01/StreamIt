import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "@/components/Loader";
import { ShortCrypt } from "short-crypt";
import { api, setApiToken } from "./api";
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
      logout(): void;
    };

export const AuthContext = createContext<AuthValue>({} as AuthValue);

const sc = new ShortCrypt("superstreamer");

type AuthProviderProps = {
  children: ReactNode;
};

type Credentials = {
  username: string;
  password: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: Credentials) => {
    setError(false);
    setLoading(true);

    const result = await api.auth.index.post(credentials);

    if (result.status === 200 && result.data) {
      saveToken(result.data.token);
      setToken(result.data.token);
      setUser(result.data.user);
    } else {
      setError(true);
    }

    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  useLayoutEffect(() => {
    setApiToken(token);
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      api.auth.index.get().then((result) => {
        if (result.status === 200 && result.data) {
          setUser(result.data);
        }
      });
    }
  }, [token, user]);

  const value = useMemo(() => {
    return token && user
      ? { token, user, logout }
      : {
          token: null,
          error,
          loading,
          login,
        };
  }, [token, user, login, logout, error, loading]);

  const ready = (!user && !token) || (user && token);

  return (
    <AuthContext.Provider value={value}>
      {ready ? (
        children
      ) : (
        <div className="h-screen flex items-center justify-center">
          <Loader />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const data = useContext(AuthContext);
  if (!data.token) {
    throw new Error("Missing token");
  }
  return data;
}

function Auth(props: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  return token ? props.children : <Navigate to="/login" />;
}

export function auth(component: ReactNode) {
  return <Auth>{component}</Auth>;
}
