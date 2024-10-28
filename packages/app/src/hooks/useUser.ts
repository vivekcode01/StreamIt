import { useApi } from "@/ApiContext";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useUser() {
  const api = useApi();

  const { data } = useSuspenseQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const result = await api.profile.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  return data;
}
