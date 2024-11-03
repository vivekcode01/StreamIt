import { useQuery } from "@tanstack/react-query";
import { JobLog } from "@/components/JobLog";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshFunction } from "@/hooks/useAutoRefreshFunction";

interface JobLogsProps {
  id: string;
}

export function JobLogs({ id }: JobLogsProps) {
  const { api } = useAuth();

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
