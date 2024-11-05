import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { JsonDump } from "./JsonDump";
import type { Job } from "@superstreamer/api/client";

interface JobPageProps {
  job: Job;
  logs: string[];
}

export function JobPage({ job, logs }: JobPageProps) {
  const progress = Object.entries(job.progress ?? {});

  return (
    <>
      {job.failedReason ? (
        <Card className="p-4 mx-4 mt-4 text-danger">{job.failedReason}</Card>
      ) : null}
      <div className="flex flex-col w-full p-4 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>Created: {job.createdAt}</div>
          <div>Duration: {job.duration}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>Input</CardHeader>
              <CardBody>
                <JsonDump data={job.inputData} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Output</CardHeader>
              <CardBody>
                <JsonDump data={job.outputData} />
              </CardBody>
            </Card>
          </div>
          <div>
            {progress.map(([key, value]) => (
              <div>
                {key}: {value}
              </div>
            ))}
            <Card>
              <CardHeader>Logs</CardHeader>
              <CardBody>
                <ul className="overflow-x-auto">
                  {logs.map((log) => (
                    <li>
                      <pre className="text-xs break-all">{log}</pre>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
