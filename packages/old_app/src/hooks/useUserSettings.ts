import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { UserSettings } from "@superstreamer/api/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserSettings() {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  const { data: userSettings } = useSuspenseQuery({
    queryKey: ["user", "settings"],
    queryFn: async () => {
      const result = await api.user.settings.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (fields: UserSettings) => {
      return api.user.settings.put(fields);
    },
    onSuccess: async (data) => {
      if (data.status === 200) {
        queryClient.setQueryData(["user", "settings"], data.data);
      }
    },
  });

  return { mutation, userSettings };
}
