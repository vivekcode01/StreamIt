import { useSuspenseQuery } from "@tanstack/react-query";
import { AutoRefreshStatus } from "./auto-refresh/AutoRefreshStatus";
import { useAuth } from "@/AuthContext";
import { JobsFilter } from "@/components/JobsFilter";
import { JobsList } from "@/components/JobsList";
import { JobsStats } from "@/components/JobsStats";
import { useAutoRefreshFunction } from "@/components/auto-refresh/AutoRefreshContext";
import { useJobsFilter } from "@/hooks/useJobsFilter";
import { filterJobs } from "@/lib/jobs-filter";

export function JobsOverview() {
  const [filter, setFilter] = useJobsFilter();
  const { api } = useAuth();

  const { data, refetch } = useSuspenseQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const result = await api.jobs.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  useAutoRefreshFunction(refetch);

  const filteredJobs = filterJobs(data, filter);

  return (
    <>
      <div className="h-14 border-b flex px-4">
        <div className="flex gap-2 items-center w-full">
          <JobsStats jobs={data} filter={filter} onChange={setFilter} />
          <div className="ml-auto flex items-center gap-2">
            <JobsFilter allJobs={data} filter={filter} onChange={setFilter} />
            <AutoRefreshStatus />
          </div>
        </div>
      </div>
      <div className="p-4 grow basis-0 overflow-auto">
        <div className="max-w-2xl w-full mx-auto">
          {filteredJobs.length ? (
            <JobsList jobs={filteredJobs} />
          ) : (
            <p className="text-center py-16 text-muted-foreground">
              Nothing here but tumbleweeds... and they're not clickable.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
