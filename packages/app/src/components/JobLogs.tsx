import { useQuery } from "@tanstack/react-query";
import { JobLog } from "./JobLog";
import { useApi } from "@/ApiContext";
import { useAutoRefreshFunction } from "@/components/auto-refresh/AutoRefreshContext";

type JobLogsProps = {
  id: string;
};

export function JobLogs({ id }: JobLogsProps) {
  const api = useApi();

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

  useAutoRefreshFunction(refetch);

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
