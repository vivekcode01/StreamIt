import type { SelectObjectItem } from "@/components/SelectObject";
import type { JobsFilterData } from "@/hooks/useJobsFilter";
import type { Job } from "@superstreamer/api/client";
import { SelectObject } from "@/components/SelectObject";

interface JobsFilterProps {
  allJobs: Job[];
  filter: JobsFilterData;
  onChange(value: Partial<JobsFilterData>): void;
}

export function JobsFilter({ allJobs, filter, onChange }: JobsFilterProps) {
  const names = getNames(allJobs).map<SelectObjectItem<string | null>>(
    (name) => ({
      value: name,
      label: name,
    }),
  );

  names.unshift({ value: null, label: "All names" });

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
