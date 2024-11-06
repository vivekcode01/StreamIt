import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { Format } from "../../../components/Format";
import { FullTable } from "../../../components/FullTable";
import { Uniqolor } from "../../../components/Uniqolor";
import type { Group } from "@superstreamer/api/client";
import type { Asset } from "@superstreamer/api/client";

export const Route = createFileRoute("/(dashboard)/_layout/assets")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(20),
      sortKey: z
        .enum(["createdAt", "playables", "groupId", "name"])
        .default("createdAt"),
      sortDir: z.enum(["asc", "desc"]).default("desc"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    return {
      assets: await context.auth.api.assets.get({ query: deps }),
      groups: await context.auth.api.groups.get(),
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { assets, groups } = Route.useLoaderData();
  const filter = Route.useLoaderDeps();

  if (!assets.data || !groups.data) {
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
            id: "groupId",
            label: "Group",
            allowsSorting: true,
          },
          {
            id: "createdAt",
            label: "Created",
            allowsSorting: true,
          },
        ]}
        {...assets.data}
        filter={filter}
        onFilterChange={(search) => {
          navigate({ search });
        }}
        mapRow={(item) => ({
          key: item.id,
          cells: [
            item.name,
            item.playables,
            <GroupTag groups={groups.data} asset={item} />,
            <Format format="date" value={item.createdAt} />,
          ],
        })}
      />
    </div>
  );
}

function GroupTag({ groups, asset }: { groups: Group[]; asset: Asset }) {
  const group = groups.find((group) => group.id === asset.groupId);
  if (!group) {
    return <Uniqolor value="default" />;
  }
  return <Uniqolor value={group.name} />;
}
