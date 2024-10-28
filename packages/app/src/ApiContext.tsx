import { createContext, useContext, useMemo } from "react";
import { createApiClient } from "@superstreamer/api/client";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

export type * from "@superstreamer/api/client";

type ApiContextValue = ReturnType<typeof createApiClient>;

const ApiContext = createContext<ApiContextValue>({} as ApiContextValue);

type ApiProviderProps = {
  children: ReactNode;
};

export function ApiProvider({ children }: ApiProviderProps) {
  const { token } = useAuth();

  const api = useMemo(() => {
    return createApiClient(window.__ENV__.PUBLIC_API_ENDPOINT, token);
  }, [token]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  return useContext(ApiContext);
}
