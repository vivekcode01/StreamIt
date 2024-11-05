import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

export function useStorage(path: string) {
  const { api } = useUser();

  const { data, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery({
    queryKey: ["storage", path],
    queryFn: async ({ queryKey, pageParam }) => {
      const result = await api.storage.folder.get({
        query: {
          path: queryKey[1],
          cursor: pageParam.cursor,
          take: 30,
        },
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    initialPageParam: { cursor: "" },
    getNextPageParam: (lastPage) => {
      return lastPage?.cursor ? { cursor: lastPage.cursor } : undefined;
    },
    gcTime: 0,
    staleTime: 0,
  });

  return { data, fetchNextPage, hasNextPage };
}
