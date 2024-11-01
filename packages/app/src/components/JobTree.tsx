import { JobTreeItem } from "./JobTreeItem";
import type { Job } from "@superstreamer/api/client";
import { cn } from "@/lib/utils";

interface JobTreeProps {
  job: Job;
  activeId: string;
  depth?: number;
}

export function JobTree({ job, activeId, depth = 0 }: JobTreeProps) {
  return (
    <div className={cn(depth && "ml-4")}>
      <JobTreeItem job={job} activeId={activeId} />
      <ul>
        {job.children.map((childJob) => (
          <JobTree
            key={childJob.id}
            job={childJob}
            activeId={activeId}
            depth={depth + 1}
          />
        ))}
      </ul>
    </div>
  );
}
