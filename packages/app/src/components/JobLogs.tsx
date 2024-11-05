import { useJobLogs } from "../hooks/useJobLogs";
import type { Job } from "@superstreamer/api/client";

interface JobLogsProps {
  job: Job;
}

export function JobLogs({ job }: JobLogsProps) {
  const logs = useJobLogs(job.id);

  return (
    <ul className="overflow-x-auto">
      {logs.map((log) => (
        <li>
          <pre className="text-xs break-all">{log}</pre>
        </li>
      ))}
    </ul>
  );
}
