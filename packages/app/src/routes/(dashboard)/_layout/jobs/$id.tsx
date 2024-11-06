import { createFileRoute } from "@tanstack/react-router";
import { AutoRefresh } from "../../../../components/AutoRefresh";
import { JobPage } from "../../../../components/JobPage";
import { JobTree } from "../../../../components/JobTree";
import type { ApiClient, Job } from "@superstreamer/api/client";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/$id")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { rootJob, job } = await getJob(context.auth.api, params.id);
    if (!job) {
      throw new Error("Missing job");
    }
    const { data: logs } = await context.auth.api
      .jobs({ id: params.id })
      .logs.get();
    if (!logs) {
      throw new Error("Missing logs");
    }
    return {
      rootJob,
      job,
      logs,
    };
  },
});

function RouteComponent() {
  const { rootJob, job, logs } = Route.useLoaderData();

  return (
    <div className="flex h-screen">
      <div className="max-w-[220px] w-full h-full bg-white border-r p-4 flex flex-col">
        <JobTree activeJob={job} jobs={[rootJob]} />
        <div className="grow" />
        <AutoRefresh interval={5} defaultEnabled />
      </div>
      <div className="grow h-full basis-0 overflow-y-auto">
        <JobPage job={job} logs={logs} />
      </div>
    </div>
  );
}

async function getJob(api: ApiClient, id: string) {
  const { data: rootJob } = await api
    .jobs({ id })
    .get({ query: { fromRoot: true } });

  if (!rootJob) {
    throw new Error("No root job found");
  }

  const findJob = (job: Job): Job | null => {
    if (job.id === id) {
      return job;
    }
    for (const childJob of job.children) {
      const result = findJob(childJob);
      if (result) {
        return result;
      }
    }
    return null;
  };

  return {
    rootJob,
    job: findJob(rootJob),
  };
}
