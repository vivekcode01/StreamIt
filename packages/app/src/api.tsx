import { createClient } from "@superstreamer/api/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { ApiClient } from "@superstreamer/api/client";
import type { ReactNode } from "react";

export interface ApiContext {
  api: ApiClient;
}

const ApiContext = createContext<ApiContext | null>(null);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [api] = useState(() =>
    createClient(window.__ENV__.PUBLIC_API_ENDPOINT),
  );
  const { token } = useAuth();

  useEffect(() => {
    api.setToken(token);
  }, [api, token]);

  return (
    <ApiContext.Provider value={{ api: api.client }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
