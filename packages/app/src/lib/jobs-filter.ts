import type { JobsFilterData } from "@/hooks/useJobsFilter";
import type { Job } from "@superstreamer/api/client";

export function filterJobs(jobs: Job[], filter: JobsFilterData) {
  if (filter.tag) {
    jobs = jobs.filter((job) => {
      if (filter.tag === "none") {
        return job.tag === null;
      }
      return job.tag === filter.tag;
    });
  }

  if (filter.name) {
    jobs = jobs.filter((job) => job.name === filter.name);
  }

  if (filter.state) {
    jobs = jobs.filter((job) => job.state === filter.state);
  }

  return jobs;
}
