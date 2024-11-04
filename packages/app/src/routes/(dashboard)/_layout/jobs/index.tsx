import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { FullTable } from "../../../../components/FullTable";
import { jobsFilterSchema, useJobs } from "../../../../hooks/useJobs";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(jobsFilterSchema),
});

function RouteComponent() {
  const filter = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const data = useJobs(filter);

  if (!data) {
    return null;
  }

  return (
    <FullTable
      columns={[
        {
          id: "name",
          label: "Name",
          allowsSorting: true,
        },
        {
          id: "duration",
          label: "Duration",
          allowsSorting: true,
        },
        {
          id: "createdAt",
          label: "Created",
          allowsSorting: true,
        },
      ]}
      {...data}
      filter={filter}
      navigate={navigate}
      mapRow={(job) => [
        <Link to={`/jobs/${job.id}`}>
          {job.id}
          <div>{job.name}</div>
        </Link>,
        job.duration,
        job.createdAt,
      ]}
    />
  );
}
