import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { toParams } from "@superstreamer/api/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import cn from "clsx";
import { File, Folder } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useApi } from "../../../api";
import { FilePreview } from "../../../components/FilePreview";
import { Format } from "../../../components/Format";
import { FullTableScroll } from "../../../components/FullTableScroll";
import { PageTitle } from "../../../components/PageTitle";
import { useInfinite } from "../../../hooks/useInfinite";
import type { ApiClient, StorageItem } from "@superstreamer/api/client";

export const Route = createFileRoute("/(dashboard)/_layout/storage")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      path: z.string().default("/"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    const { api } = context.api;
    return await getFolderItems(api, deps.path, "");
  },
});

function RouteComponent() {
  const deps = Route.useLoaderDeps();
  const result = Route.useLoaderData();
  const { api } = useApi();
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const { hasMore, items, loadMore } = useInfinite(result, async (cursor) => {
    return await getFolderItems(api, deps.path, cursor);
  });

  const breadcrumbs = parseBreadcrumbs(deps.path);

  return (
    <div className="flex flex-col h-full p-6">
      <PageTitle
        title="Storage"
        description="View and preview your S3 files here."
      />
      <div className="flex items-center mb-4">
        <Link
          className={cn(
            "text-sm",
            breadcrumbs.length > 1 && "text-foreground/50",
          )}
          to={Route.fullPath}
          search={{ path: "/" }}
        >
          main
        </Link>
        <Breadcrumbs className="flex items-center">
          {breadcrumbs.map(({ name, path }) => (
            <BreadcrumbItem key={path}>
              <Link to={Route.fullPath} search={{ path }}>
                {name}
              </Link>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
      <FullTableScroll
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
            <Item item={item} setPreviewPath={setPreviewPath} />,
            <Format
              format="size"
              value={item.type === "file" ? item.size : null}
            />,
          ],
        })}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
      <FilePreview
        path={previewPath}
        onClose={() => {
          setPreviewPath(null);
        }}
      />
    </div>
  );
}

async function getFolderItems(api: ApiClient, path: string, cursor: string) {
  const response = await api.storage.items.$get({
    query: toParams({
      path,
      cursor,
      take: 30,
    }),
  });
  return await response.json();
}

function parseBreadcrumbs(path: string) {
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

function Item({
  item,
  setPreviewPath,
}: {
  item: StorageItem;
  setPreviewPath(value: string): void;
}) {
  const chunks = item.path.split("/");

  if (item.type === "folder") {
    const name = chunks[chunks.length - 2];
    return (
      <Link to={Route.fullPath} search={{ path: item.path }}>
        {name}
      </Link>
    );
  }

  if (item.type === "file") {
    const name = chunks[chunks.length - 1];
    return (
      <button
        onClick={() => {
          setPreviewPath(item.path);
        }}
      >
        {name}
      </button>
    );
  }
}

function Icon({ item }: { item: StorageItem }) {
  if (item.type === "folder") {
    return <Folder className="w-4 h-4" />;
  }
  if (item.type === "file") {
    return <File className="w-4 h-4" />;
  }
}
