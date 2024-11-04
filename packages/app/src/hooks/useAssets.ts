import { keepPreviousData, useQuery } from "@tanstack/react-query";
import z from "zod";
import { useUser } from "./useUser";

export const assetsFilterSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
  sortKey: z.enum(["createdAt", "playables", "name"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export type AssetsFilter = z.infer<typeof assetsFilterSchema>;

export function useAssets(filter: AssetsFilter) {
  const { api } = useUser();

  const { data } = useQuery({
    queryKey: ["assets", "list", filter],
    queryFn: async () => {
      const result = await api.assets.get({
        query: filter,
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });

  return data;
}
