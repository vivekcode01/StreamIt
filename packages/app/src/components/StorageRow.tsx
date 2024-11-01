import Folder from "lucide-react/icons/folder";
import { StorageRowFile } from "./StorageRowFile";
import { TransitionNavLink } from "./TransitionNavLink";
import type { StorageFile, StorageFolderItem } from "@superstreamer/api/client";
import { TableCell, TableRow } from "@/components/ui/table";

interface StorageRowProps {
  item: StorageFolderItem;
  setFile(file: StorageFile): void;
}

export function StorageRow({ item, setFile }: StorageRowProps) {
  const chunks = item.path.split("/");

  if (item.type === "folder") {
    const name = chunks[chunks.length - 2];
    return (
      <TableRow>
        <TableCell>
          <Folder className="w-4 h-4" />
        </TableCell>
        <TableCell>
          <TransitionNavLink
            to={`/storage?path=${item.path}`}
            className="flex gap-2 text-sm items-center hover:underline w-full"
          >
            {name}
          </TransitionNavLink>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  if (item.type === "file") {
    const name = chunks[chunks.length - 1];
    return <StorageRowFile name={name} item={item} setFile={setFile} />;
  }
  return null;
}
