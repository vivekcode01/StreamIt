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
    <FullTable
      columns={[
        {
          id: "name",
          label: "Name",
          allowsSorting: true,
        },
        {
          id: "playablesCount",
          label: "Playables",
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
      mapRow={(item) => {
        return [item.name, item.playablesCount, item.createdAt];
      }}
    />
  );
}
