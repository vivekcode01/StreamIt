import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { FullTable } from "../../../components/FullTable";
import { assetsFilterSchema, useAssets } from "../../../hooks/useAssets";

export const Route = createFileRoute("/(dashboard)/_layout/")({
  component: Index,
  validateSearch: zodSearchValidator(assetsFilterSchema),
});

function Index() {
  const filter = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const data = useAssets(filter);

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
        mapRow={(item) => {
          return [item.name, item.playables, item.createdAt];
        }}
      />
    </div>
  );
}
