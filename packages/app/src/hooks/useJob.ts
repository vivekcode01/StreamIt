import { useEffect } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useApi } from "@/ApiContext";
import { useAutoRefreshFunction } from "@/components/auto-refresh/AutoRefreshContext";
import type { Job } from "@/ApiContext";

export function useJob(id: string) {
  const queryClient = useQueryClient();
  const api = useApi();

  const { data, refetch } = useSuspenseQuery({
    queryKey: ["jobsFromRoot", id],
    queryFn: async ({ queryKey }) => {
      const result = await api
        .jobs({ id: queryKey[1] })
        .get({ query: { fromRoot: true } });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  useAutoRefreshFunction(refetch);

  useEffect(() => {
    const populateCache = (rootJob: Job, jobs: Job[]) => {
      jobs.forEach((job) => {
        queryClient.setQueryData(["jobsFromRoot", job.id], rootJob);
        populateCache(rootJob, job.children);
      });
    };

    if (data) {
      populateCache(data, [data]);
    }
  }, [data, queryClient, id]);

  const rootJob = data;

  const job = findJob(rootJob, id);
  if (!job) {
    throw new Error("Job not found in tree");
  }

  return { job, rootJob };
}

function findJob(job: Job, id: string): Job | null {
  if (job.id === id) {
    return job;
  }
  for (const childJob of job.children) {
    const result = findJob(childJob, id);
    if (result) {
      return result;
    }
  }
  return null;
}
