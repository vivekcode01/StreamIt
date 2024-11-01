import CircleSlash from "lucide-react/icons/circle-slash";
import Ellipsis from "lucide-react/icons/ellipsis";
import FileVideo from "lucide-react/icons/file-video";
import GroupIcon from "lucide-react/icons/group";
import { TableHeadSorter } from "./TableHeadSorter";
import { Button } from "./ui/button";
import type { TableFilterValue } from "@/hooks/useTableFilter";
import type { Asset, Group } from "@superstreamer/api/client";
import { ColorTag } from "@/components/ColorTag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTimeAgo } from "@/lib/helpers";

interface AssetsTableProps {
  assets: Asset[];
  groups: Group[];
  filter: TableFilterValue;
  onSort(orderBy: string, direction: string): void;
}

export function AssetsTable({
  assets,
  groups,
  filter,
  onSort,
}: AssetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeadSorter
            name="name"
            orderBy={filter.orderBy}
            direction={filter.direction}
            onChange={onSort}
          >
            Name
          </TableHeadSorter>
          <TableHead>
            <div className="flex justify-center">
              <FileVideo className="w-4 h-4" />
            </div>
          </TableHead>
          <TableHead>
            <div className="flex justify-center">
              <GroupIcon className="w-4 h-4" />
            </div>
          </TableHead>
          <TableHeadSorter
            name="createdAt"
            orderBy={filter.orderBy}
            direction={filter.direction}
            onChange={onSort}
          >
            Created
          </TableHeadSorter>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => {
          const group = groups.find((group) => group.id === asset.groupId);
          return (
            <TableRow key={asset.id}>
              <TableCell className="w-full">{asset.name}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {asset.playablesCount > 0 ? (
                    <span>{asset.playablesCount}</span>
                  ) : (
                    <CircleSlash className="w-4 h-4 text-pink-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <ColorTag value={group?.name ?? "none"} />
                </div>
              </TableCell>
              <TableCell className="text-nowrap">
                {getTimeAgo(asset.createdAt)}
              </TableCell>
              <TableCell className="py-0">
                <div className="flex justify-center">
                  <Button size="icon" variant="ghost">
                    <Ellipsis className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
