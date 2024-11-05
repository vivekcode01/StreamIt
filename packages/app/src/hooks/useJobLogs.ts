import { useSuspenseQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

export function useJobLogs(id: string) {
  const { api } = useUser();

  const { data } = useSuspenseQuery({
    queryKey: ["jobs", id, "logs"],
    queryFn: async ({ queryKey }) => {
      const result = await api.jobs({ id: queryKey[1] }).logs.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  return data;
}
