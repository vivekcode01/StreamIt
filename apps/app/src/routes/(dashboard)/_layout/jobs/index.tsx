import { toParams } from "@superstreamer/api/client";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { AutoRefresh } from "../../../../components/AutoRefresh";
import { Format } from "../../../../components/Format";
import { FullTable } from "../../../../components/FullTable";
import { JobState } from "../../../../components/JobState";
import { PageTitle } from "../../../../components/PageTitle";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(20),
      sortKey: z.enum(["name", "duration", "createdAt"]).default("createdAt"),
      sortDir: z.enum(["asc", "desc"]).default("desc"),
      query: z.string().default(""),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    const { api } = context.api;
    const response = await api.jobs.$get({ query: toParams(deps) });
    return {
      jobs: await response.json(),
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { jobs } = Route.useLoaderData();

  return (
    <div className="p-8">
      <PageTitle
        title="Jobs"
        description="Manage your running, pending and scheduled jobs here."
        sideComponent={<AutoRefresh interval={5} defaultEnabled />}
      />
      <FullTable
        title="All jobs"
        columns={[
          {
            id: "state",
            label: "",
            className: "w-4",
          },
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
        totalPages={jobs.totalPages}
        items={jobs.items}
        filter={jobs.filter}
        onFilterChange={(search) => {
          navigate({ search });
        }}
        mapRow={(item) => ({
          key: item.id,
          cells: [
            <JobState job={item} />,
            <Link to={`/jobs/${item.id}`}>
              <div className="font-medium">{item.name}</div>
              <Format className="text-xs" format="short-id" value={item.id} />
            </Link>,
            <Format format="duration" value={item.duration} />,
            <Format format="date" value={item.createdAt} />,
          ],
        })}
      />
    </div>
  );
}
