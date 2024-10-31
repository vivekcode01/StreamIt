import { useAuth } from "@/AuthContext";
import { AssetsTable } from "@/components/AssetsTable";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { TablePagination } from "@/components/TablePagination";
import { useProgressTransition } from "@/hooks/useProgressTransition";

export function AssetsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { api } = useAuth();
  const [, startTransition] = useProgressTransition();

  const paramPage = searchParams.get("page");
  const page = paramPage ? +paramPage : 1;
  const sort = searchParams.get("sort") ?? "createdAt:asc";

  const [listQuery, groupsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["assets", "list", page, location.search],
        queryFn: async () => {
          const result = await api.assets.get({
            query: {
              perPage: 20,
              page,
              sort,
            },
          });
          if (result.error) {
            throw result.error;
          }
          return result.data;
        },
      },
      {
        staleTime: 0,
        gcTime: 0,
        queryKey: ["assets", "groups"],
        queryFn: async () => {
          const result = await api.groups.get();
          if (result.error) {
            throw result.error;
          }
          return result.data;
        },
      },
    ],
  });

  return (
    <div>
      <div className="h-14 border-b flex px-4"></div>
      <div className="p-8">
        <div className="border border-border rounded-lg mb-4">
          <AssetsTable
            sort={sort}
            assets={listQuery.data.rows}
            groups={groupsQuery.data}
            onSort={(sort) => {
              startTransition(() => {
                setSearchParams({ sort });
              });
            }}
          />
        </div>
        <div className="flex justify-end">
          <TablePagination
            page={listQuery.data.page}
            totalPages={listQuery.data.totalPages}
            onSelect={(page) => {
              startTransition(() => {
                setSearchParams({ page: page.toString() });
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
