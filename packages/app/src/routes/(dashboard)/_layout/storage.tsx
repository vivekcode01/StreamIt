import { createFileRoute, Link } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import z from "zod";
import { FullTable } from "../../../components/FullTable";
import { useStorage } from "../../../hooks/useStorage";

export const Route = createFileRoute("/(dashboard)/_layout/storage")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      path: z.string().default("/"),
    }),
  ),
});

function RouteComponent() {
  const { path } = Route.useSearch();
  const { data, fetchNextPage, hasNextPage } = useStorage(path);

  const items = data.pages.flatMap((page) => page.items);

  return (
    <div className="flex h-full p-8">
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
        mapRow={(item) => {
          return [
            item.type,
            <Link
              to={item.type === "folder" ? Route.fullPath : "/file"}
              search={{ path: item.path }}
            >
              {item.path}
            </Link>,
          ];
        }}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
