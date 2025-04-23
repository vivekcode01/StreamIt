import type { Job } from "@superstreamer/api/client";
import { Link } from "@tanstack/react-router";
import cn from "clsx";
import { JobState } from "./JobState";

interface JobTreeProps {
  activeJob: Job;
  jobs: Job[];
  depth?: number;
}

export function JobTree({ activeJob, jobs, depth = 0 }: JobTreeProps) {
  return (
    <div className={cn(depth !== 0 && "ml-4")}>
      {jobs.map((job) => (
        <div key={job.id}>
          <div className="flex gap-2 items-center">
            <JobState job={job} />
            <Link
              to="/jobs/$id"
              params={{ id: job.id }}
              className={cn(
                "text-sm py-1 block",
                job === activeJob && "text-primary",
              )}
            >
              {job.name}
            </Link>
          </div>
          <JobTree
            activeJob={activeJob}
            jobs={job.children}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
}
