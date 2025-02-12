import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/drawer";
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { CircleSlash, SquarePen } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "../../../auth";
import { Form } from "../../../components/Form";
import { Format } from "../../../components/Format";
import { FullTable } from "../../../components/FullTable";
import { Uniqolor } from "../../../components/Uniqolor";
import type { Asset, Group } from "@superstreamer/api/client";

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
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  if (!assets.data || !groups.data) {
    return null;
  }

  return (
    <div className="p-8">
      <h2 className="mb-4 font-medium">Assets</h2>
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
          {
            id: "actions",
            label: "Actions",
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
            <Name asset={item} />,
            <Playables asset={item} />,
            <GroupTag groups={groups.data} asset={item} />,
            <Format format="date" value={item.createdAt} />,
            <div className="flex items-center">
              <button onClick={() => setEditAsset(item)}>
                <SquarePen className="w-4 h-4" />
              </button>
            </div>,
          ],
        })}
      />
      <EditAssetDrawer asset={editAsset} onClose={() => setEditAsset(null)} />
    </div>
  );
}

function Name({ asset }: { asset: Asset }) {
  if (!asset.name) {
    return <span>{asset.id}</span>;
  }
  return (
    <div>
      {asset.name}
      <div className="text-xs opacity-50">{asset.id}</div>
    </div>
  );
}

function GroupTag({ groups, asset }: { groups: Group[]; asset: Asset }) {
  const group = groups.find((group) => group.id === asset.groupId);
  return <Uniqolor value={group?.name ?? "default"} />;
}

function Playables({ asset }: { asset: Asset }) {
  return (
    <div className="w-12 flex justify-center">
      {asset.playables ? (
        <Link to="/storage" search={{ path: `/package/${asset.id}/` }}>
          {asset.playables}
        </Link>
      ) : (
        <CircleSlash className="w-4 h-4" />
      )}
    </div>
  );
}

function EditAssetDrawer({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { api } = useAuth();

  return (
    <Drawer isOpen={asset !== null} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>Asset</DrawerHeader>
        {asset ? (
          <DrawerBody>
            <div className="mb-4">{asset.id}</div>
            <Form
              fields={{
                name: {
                  type: "string",
                  label: "Name",
                  value: asset.name,
                },
              }}
              onSubmit={async (values) => {
                await api.assets({ id: asset.id }).put(values);
                await router.invalidate();
                onClose();
              }}
            />
          </DrawerBody>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
