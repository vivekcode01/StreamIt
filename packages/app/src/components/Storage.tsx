import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StorageFilePreview } from "./StorageFilePreview";
import { StoragePathBreadcrumbs } from "./StoragePathBreadcrumbs";
import { StorageTable } from "./StorageTable";
import type { StorageFile } from "@superstreamer/api/client";
import { useAuth } from "@/AuthContext";

interface StorageProps {
  path: string;
}

export function Storage({ path }: StorageProps) {
  const [file, setFile] = useState<StorageFile | null>(null);
  const { api } = useAuth();

  const { data, fetchNextPage } = useSuspenseInfiniteQuery({
    queryKey: ["storage", path],
    queryFn: async ({ queryKey, pageParam }) => {
      const result = await api.storage.folder.get({
        query: {
          path: queryKey[1],
          cursor: pageParam.cursor,
          take: 30,
        },
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    initialPageParam: { cursor: "" },
    getNextPageParam: (lastPage) => {
      return lastPage?.cursor ? { cursor: lastPage.cursor } : undefined;
    },
  });

  const items = data.pages.flatMap((page) => page.items ?? []);

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b flex items-center">
        <StoragePathBreadcrumbs path={path} />
      </div>
      <StorageTable items={items} onNext={fetchNextPage} setFile={setFile} />
      <StorageFilePreview file={file} onClose={() => setFile(null)} />
    </div>
  );
}
