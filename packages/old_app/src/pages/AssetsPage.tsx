import { useSuspenseQueries } from "@tanstack/react-query";
import { AssetsTable } from "@/components/AssetsTable";
import { SelectObject } from "@/components/SelectObject";
import { TablePagination } from "@/components/TablePagination";
import { useAuth } from "@/hooks/useAuth";
import { useLoadTransition } from "@/hooks/useLoadTransition";
import { useTableFilter } from "@/hooks/useTableFilter";

export function AssetsPage() {
  const { filter, updateFilter } = useTableFilter({
    page: 1,
    perPage: 20,
    orderBy: "createdAt",
    direction: "desc",
  });

  const { api } = useAuth();
  const [, startTransition] = useLoadTransition();

  const [listQuery, groupsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["assets", "list", filter],
        queryFn: async () => {
          const result = await api.assets.get({
            query: filter,
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

  if (filter.page > listQuery.data.totalPages) {
    updateFilter({ page: listQuery.data.totalPages });
  }

  const rowsPerPage = [5, 20, 50].map((value) => ({ value }));

  return (
    <div className="p-8">
      <h1 className="mb-8 text-xl font-semibold">Assets</h1>
      <div className="border border-border rounded-lg mb-4">
        <AssetsTable
          filter={filter}
          assets={listQuery.data.assets}
          groups={groupsQuery.data}
          onSort={(orderBy, direction) => {
            startTransition(() => updateFilter({ orderBy, direction }));
          }}
        />
      </div>
      <div className="flex justify-end gap-10">
        <div className="flex gap-2 items-center text-sm">
          Rows per page
          <SelectObject
            className="h-8 max-w-[65px]"
            items={rowsPerPage}
            value={filter.perPage}
            onChange={(perPage) => {
              startTransition(() => updateFilter({ perPage }));
            }}
          />
        </div>
        <TablePagination
          page={listQuery.data.page}
          totalPages={listQuery.data.totalPages}
          onSelect={(page) => {
            startTransition(() => updateFilter({ page }));
          }}
        />
      </div>
    </div>
  );
}
