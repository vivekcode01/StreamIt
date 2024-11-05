import { createFileRoute } from "@tanstack/react-router";
import { JobPage } from "../../../../components/JobPage";
import { JobTree } from "../../../../components/JobTree";
import { useJob } from "../../../../hooks/useJob";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const job = useJob(id);

  return (
    <div className="flex h-screen">
      <div className="max-w-[220px] w-full h-full bg-white border-r p-4">
        <JobTree activeJob={job.job} jobs={[job.rootJob]} />
      </div>
      <div className="grow h-full basis-0 overflow-y-auto">
        <JobPage job={job.job} />
      </div>
    </div>
  );
}
