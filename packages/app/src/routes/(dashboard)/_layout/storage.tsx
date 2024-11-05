import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { File, Folder, House } from "lucide-react";
import z from "zod";
import { useAuth } from "../../../auth";
import { Format } from "../../../components/Format";
import { FullTable } from "../../../components/FullTable";
import { useInfinite } from "../../../hooks/useInfinite";
import type { ApiClient, StorageFolderItem } from "@superstreamer/api/client";

export const Route = createFileRoute("/(dashboard)/_layout/storage")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      path: z.string().default("/"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    return await getFolderItems(context.auth.api, deps.path, "");
  },
});

function RouteComponent() {
  const deps = Route.useLoaderDeps();
  const result = Route.useLoaderData();
  const { api } = useAuth();

  const { hasMore, items, loadMore } = useInfinite(result, async (cursor) => {
    return await getFolderItems(api, deps.path, cursor);
  });

  const paths = parsePathInPaths(deps.path);

  return (
    <div className="flex flex-col h-full p-8">
      <Breadcrumbs className="mb-4 h-4 flex items-center">
        {paths.map(({ name, path }) => (
          <BreadcrumbItem key={path}>
            <Link to={Route.fullPath} search={{ path }}>
              {name || <House className="w-3 h-3" />}
            </Link>
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
      <FullTable
        classNames={{
          base: "grow",
          wrapper: "grow basis-0",
        }}
        columns={[
          {
            id: "type",
            label: "",
            className: "w-4",
          },
          {
            id: "path",
            label: "Path",
          },
          {
            id: "size",
            label: "Size",
          },
        ]}
        items={items}
        mapRow={(item) => ({
          key: item.path,
          cells: [
            <Icon item={item} />,
            <Item item={item} />,
            <Format
              format="size"
              value={item.type === "file" ? item.size : null}
            />,
          ],
        })}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}

async function getFolderItems(api: ApiClient, path: string, cursor: string) {
  const { data } = await api.storage.folder.get({
    query: {
      path,
      cursor,
      take: 30,
    },
  });
  if (!data) {
    throw new Error("Failed data");
  }
  return data;
}

function parsePathInPaths(path: string) {
  let prevPath = "";

  const paths = path.split("/").map((part) => {
    const result = {
      name: part,
      path: prevPath + part + "/",
    };
    prevPath += part + "/";
    return result;
  });

  paths.pop();

  return paths;
}

function Item({ item }: { item: StorageFolderItem }) {
  const chunks = item.path.split("/");
  const name = chunks[chunks.length - (item.type === "file" ? 1 : 2)];
  return (
    <Link
      to={item.type === "folder" ? Route.fullPath : "/file"}
      search={{ path: item.path }}
    >
      {name}
    </Link>
  );
}

function Icon({ item }: { item: StorageFolderItem }) {
  if (item.type === "file") {
    return <File className="w-4 h-4" />;
  }
  if (item.type === "folder") {
    return <Folder className="w-4 h-4" />;
  }
}
