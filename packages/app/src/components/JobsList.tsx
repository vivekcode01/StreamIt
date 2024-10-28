import { TransitionNavLink } from "./TransitionNavLink";
import { JobState } from "./JobState";
import { getDurationStr, getShortId, getTimeAgo } from "@/lib/helpers";
import { JobTag } from "./JobTag";
import type { Job } from "@/ApiContext";

type JobsListProps = {
  jobs: Job[];
};

export function JobsList({ jobs }: JobsListProps) {
  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id} className="mb-2">
          <TransitionNavLink
            to={`/jobs/${job.id}`}
            className="px-4 h-20 flex items-center border border-border rounded-md hover:shadow-sm transition-shadow hover:bg-muted/50"
          >
            <div className="grow grid grid-cols-3 gap-2 items-center">
              <div className="flex items-center gap-4">
                <JobState state={job.state} />
                <div>
                  <div className="text-xs">{getShortId(job.id)}</div>
                  {job.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {getDurationStr(job.duration)}
                </div>
              </div>
              <div className="text-right">
                {job.tag === "default" ? null : <JobTag tag={job.tag} />}
                <div className="text-sm text-muted-foreground">
                  {getTimeAgo(job.createdOn)}
                </div>
              </div>
            </div>
          </TransitionNavLink>
        </li>
      ))}
    </ul>
  );
}
