import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { House } from "lucide-react";
import z from "zod";
import { useAuth } from "../../../auth";
import { FullTable } from "../../../components/FullTable";
import { useInfinite } from "../../../hooks/useInfinite";
import type { ApiClient } from "@superstreamer/api/client";

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
      <Breadcrumbs>
        {paths.map(({ name, path }) => (
          <BreadcrumbItem>
            <Link to={Route.fullPath} search={{ path }}>
              {name || <House className="w-4 h-4" />}
            </Link>
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
      <FullTable
        columns={[
          {
            id: "type",
            label: "Type",
            className: "w-8",
          },
          {
            id: "path",
            label: "Path",
          },
        ]}
        items={items}
        mapRow={(item) => ({
          key: item.path,
          cells: [
            item.type,
            <Link
              to={item.type === "folder" ? Route.fullPath : "/file"}
              search={{ path: item.path }}
            >
              {item.path}
            </Link>,
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
