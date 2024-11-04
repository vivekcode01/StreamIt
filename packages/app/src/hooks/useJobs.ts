import { keepPreviousData, useQuery } from "@tanstack/react-query";
import z from "zod";
import { useUser } from "./useUser";

export const jobsFilterSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
  sortKey: z.enum(["createdAt", "duration", "name"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export type JobsFilter = z.infer<typeof jobsFilterSchema>;

export function useJobs(filter: JobsFilter) {
  const { api } = useUser();

  const { data } = useQuery({
    queryKey: ["jobs", filter],
    queryFn: async () => {
      const result = await api.jobs.get({
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
