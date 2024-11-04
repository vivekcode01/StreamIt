import { createApiClient } from "@superstreamer/api/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { tokenAtom } from "./useAuth";

export function useUser() {
  const [token] = useAtom(tokenAtom);

  const api = useMemo(() => {
    return createApiClient(
      window.__ENV__.PUBLIC_API_ENDPOINT,
      token ? { token } : undefined,
    );
  }, [token]);

  const { data: user } = useSuspenseQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      const result = await api.user.get();
      return result.data;
    },
  });

  return { user, api };
}
