import type { Job } from "@superstreamer/api/client";
import { JobState } from "@/components/JobState";
import { LoadNavLink } from "@/components/LoadNavLink";
import { getDurationStr } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface JobTreeItemProps {
  job: Job;
  activeId: string;
}

export function JobTreeItem({ job, activeId }: JobTreeItemProps) {
  const durationStr = getDurationStr(job.duration);

  return (
    <LoadNavLink
      to={`/jobs/${job.id}`}
      className={cn(
        "px-3 py-2 flex gap-3 items-center rounded-lg text-muted-foreground transition-all hover:text-primary text-sm",
        activeId === job.id && "bg-muted text-primary",
      )}
    >
      <JobState state={job.state} />
      {job.name}
      {durationStr ? <span className="text-xs">{durationStr}</span> : null}
    </LoadNavLink>
  );
}
