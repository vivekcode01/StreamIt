import { useSearchParams } from "react-router-dom";
import type { Job } from "@superstreamer/api/client";

export interface JobsFilterData {
  tag: string | null;
  name: string | null;
  state: Job["state"] | null;
}

export function useJobsFilter() {
  const [searchParams, setSearchParams] = useSearchParams({});

  const updateParams = (newParams: Partial<JobsFilterData>) => {
    // JSON parse & stringify will remove all undefined fields.
    setSearchParams(
      JSON.parse(
        JSON.stringify({
          ...Object.fromEntries(searchParams),
          ...newParams,
        }),
      ),
    );
  };

  const data: JobsFilterData = {
    tag: searchParams.get("tag") ?? null,
    name: searchParams.get("name") ?? null,
    state: (searchParams.get("state") ?? null) as
      | JobsFilterData["state"]
      | null,
  };
  return [data, updateParams] as const;
}
