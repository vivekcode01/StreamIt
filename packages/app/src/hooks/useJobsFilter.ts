import { useSearchParams } from "react-router-dom";
import type { JobsFilterData } from "@/components/types";

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
    tag: searchParams.get("tag") ?? undefined,
    name: searchParams.get("name") ?? undefined,
    state: (searchParams.get("state") ?? undefined) as
      | JobsFilterData["state"]
      | undefined,
  };
  return [data, updateParams] as const;
}
