import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { JobLog } from "./JobLog";
import { useAutoRefetchBind } from "./auto-refetch/useAutoRefetch";
import type { AutoRefetch } from "./auto-refetch/useAutoRefetch";

type JobLogsProps = {
  id: string;
  autoRefetch: AutoRefetch;
};

export function JobLogs({ id, autoRefetch }: JobLogsProps) {
  const { data, refetch } = useQuery({
    queryKey: ["jobs", id, "logs"],
    queryFn: async ({ queryKey }) => {
      const result = await api.jobs({ id: queryKey[1] }).logs.get();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
  });

  useAutoRefetchBind(autoRefetch, refetch);

  const logs = data ?? [];

  return (
    <ul className="flex flex-col gap-2 text-xs">
      {logs.map((it, index) => (
        <li key={index}>
          <JobLog value={it} index={index} />
        </li>
      ))}
    </ul>
  );
}
