import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { Format } from "../../../components/Format";
import { FullTable } from "../../../components/FullTable";

export const Route = createFileRoute("/(dashboard)/_layout/assets")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(20),
      sortKey: z.enum(["createdAt", "playables", "name"]).default("createdAt"),
      sortDir: z.enum(["asc", "desc"]).default("desc"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    return await context.auth.api.assets.get({ query: deps });
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
      <FullTable
        columns={[
          {
            id: "name",
            label: "Name",
            allowsSorting: true,
          },
          {
            id: "playables",
            label: "Playables",
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
            item.name,
            item.playables,
            <Format format="date" value={item.createdAt} />,
          ],
        })}
      />
    </div>
  );
}
