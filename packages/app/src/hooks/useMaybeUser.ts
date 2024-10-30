import { createApiClient } from "@superstreamer/api/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useMaybeUser(
  token: string | null,
  api: ReturnType<typeof createApiClient>,
) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      const result = await api.user.get();
      if (result.status === 401) {
        return null;
      }
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  return user;
}
