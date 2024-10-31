import { Asset } from "@superstreamer/api/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CircleOff from "lucide-react/icons/circle-off";
import CircleCheckBig from "lucide-react/icons/circle-check-big";

type AssetsTableProps = {
  assets: Asset[];
};

export function AssetsTable({ assets }: AssetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => {
          return (
            <TableRow key={asset.id}>
              <TableCell>
                <CircleCheckBig className="w-4 h-4 text-emerald-700" />
              </TableCell>
              <TableCell>{asset.id}</TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
