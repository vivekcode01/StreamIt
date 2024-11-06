import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { AutoRefresh } from "../../../../components/AutoRefresh";
import { Format } from "../../../../components/Format";
import { FullTable } from "../../../../components/FullTable";
import { JobState } from "../../../../components/JobState";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(20),
      sortKey: z.enum(["createdAt", "duration", "name"]).default("createdAt"),
      sortDir: z.enum(["asc", "desc"]).default("desc"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    return await context.auth.api.jobs.get({ query: deps });
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = Route.useLoaderData();
  const filter = Route.useLoaderDeps();

  if (!data) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <AutoRefresh interval={5} defaultEnabled />
      </div>
      <FullTable
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
        {...data}
        filter={filter}
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
