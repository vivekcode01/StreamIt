import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { JobLogs } from "./JobLogs";
import { JsonDump } from "./JsonDump";
import { OpaqueCard } from "./OpaqueCard";
import type { Job } from "@superstreamer/api/client";

interface JobPageProps {
  job: Job;
}

export function JobPage({ job }: JobPageProps) {
  const progress = Object.entries(job.progress ?? {});
  return (
    <>
      {job.failedReason ? (
        <Card className="p-4 mx-4 mt-4 text-danger">{job.failedReason}</Card>
      ) : null}
      <div className="flex flex-col w-full p-4 gap-4">
        <div className="grid grid-cols-3 gap-4">
          <OpaqueCard title="Created">{job.createdAt}</OpaqueCard>
          <OpaqueCard title="Duration">{job.duration}</OpaqueCard>
          <OpaqueCard title="Progress">
            {progress.map(([key, value]) => (
              <div>
                {key}: {value}
              </div>
            ))}
          </OpaqueCard>
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
            <Card>
              <CardHeader>Logs</CardHeader>
              <CardBody>
                <JobLogs job={job} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
