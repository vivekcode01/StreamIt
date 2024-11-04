import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Job } from "@superstreamer/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshFunction } from "@/hooks/useAutoRefreshFunction";

export function useJob(id: string) {
  const queryClient = useQueryClient();
  const { api } = useAuth();

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
