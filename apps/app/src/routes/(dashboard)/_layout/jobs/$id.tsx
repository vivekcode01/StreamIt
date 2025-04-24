import { toParams } from "@superstreamer/api/client";
import type { ApiClient, Job } from "@superstreamer/api/client";
import { createFileRoute } from "@tanstack/react-router";
import { AutoRefresh } from "../../../../components/AutoRefresh";
import { JobPage } from "../../../../components/JobPage";
import { JobTree } from "../../../../components/JobTree";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/$id")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { api } = context.api;
    const { rootJob, job } = await getJob(api, params.id);

    const response = await api.jobs[":id"].logs.$get({
      param: {
        id: params.id,
      },
    });
    const logs = await response.json();

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
  const response = await api.jobs[":id"].$get({
    param: { id },
    query: toParams({ fromRoot: true }),
  });
  const rootJob = await response.json();

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

  const job = findJob(rootJob);

  if (!job) {
    throw new Error("Cannot find job from root job");
  }

  return {
    rootJob,
    job,
  };
}
