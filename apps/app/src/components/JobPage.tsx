import { Card, CardBody } from "@heroui/react";
import { DataView } from "./DataView";
import { Format } from "./Format";
import { Logs } from "./Logs";
import type { Job } from "@superstreamer/api/client";

interface JobPageProps {
  job: Job;
  logs: string[];
}

export function JobPage({ job, logs }: JobPageProps) {
  return (
    <>
      {job.failedReason ? (
        <Card className="p-4 text-danger">{job.failedReason}</Card>
      ) : null}
      <div className="flex flex-col w-full gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium">Created</span>
            <Format className="block" format="date" value={job.createdAt} />
          </div>
          <div>
            <span className="text-sm font-medium">Duration</span>
            <Format className="block" format="duration" value={job.duration} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Input</div>
              <Card className="p-4">
                <DataView data={job.inputData} />
              </Card>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Output</div>
              <Card className="p-4">
                {job.outputData ? <DataView data={job.outputData} /> : null}
              </Card>
            </div>
          </div>
          <div>
            <div>
              <div className="text-sm font-medium mb-2">Logs</div>
              <Card className="p-4">
                <Logs lines={logs} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
