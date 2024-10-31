import { SelectObject } from "./SelectObject";
import type { Job } from "@superstreamer/api/client";
import type { JobsFilterData } from "./types";
import type { SelectObjectItem } from "./SelectObject";

type JobsFilterProps = {
  allJobs: Job[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
};

export function JobsFilter({ allJobs, filter, onChange }: JobsFilterProps) {
  const names = getNames(allJobs).map<SelectObjectItem>((name) => ({
    value: name,
    label: name,
  }));

  names.unshift({ value: undefined, label: "All names" });

  return (
    <div className="flex gap-2">
      <SelectObject
        items={names}
        value={filter.name}
        onChange={(name) => onChange({ name })}
      />
    </div>
  );
}

function getNames(jobs: Job[]) {
  return jobs.reduce<string[]>((acc, job) => {
    if (!acc.includes(job.name)) {
      acc.push(job.name);
    }
    return acc;
  }, []);
}
