import { useAuth } from "@/AuthContext";
import { AssetsTable } from "@/components/AssetsTable";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PagePagination } from "@/components/PagePagination";

export function AssetsPage() {
  const [searchParams] = useSearchParams();
  const { api } = useAuth();

  const paramPage = searchParams.get("page");
  const page = paramPage ? +paramPage : 1;

  const [listQuery, groupsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["assets", "list", page],
        queryFn: async () => {
          const result = await api.assets.get({
            query: {
              page,
            },
          });
          if (result.error) {
            throw result.error;
          }
          return result.data;
        },
      },
      {
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
      <AssetsTable assets={listQuery.data.rows} />
      <PagePagination
        page={listQuery.data.page}
        totalPages={listQuery.data.totalPages}
      />
    </div>
  );
}
