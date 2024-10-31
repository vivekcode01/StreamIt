import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ArrowUp from "lucide-react/icons/arrow-up";
import ArrowDown from "lucide-react/icons/arrow-down";
import ChevronsUpDown from "lucide-react/icons/chevrons-up-down";
import type { ReactNode } from "react";

type TableHeadSorterProps = {
  field: string;
  sort: string;
  children: ReactNode;
  onChange(sort: string): void;
};

export function TableHeadSorter({
  field,
  sort,
  children,
  onChange,
}: TableHeadSorterProps) {
  const [key, mode] = sort.split(":");

  return (
    <TableHead>
      <Button
        variant="ghost"
        className="-ml-2 px-2 flex gap-2 text-xs h-6"
        onClick={() => {
          const sort = `${field}:${mode === "asc" ? "desc" : "asc"}`;
          onChange(sort);
        }}
      >
        {children}
        {key === field ? (
          mode === "desc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3" />
        )}
      </Button>
    </TableHead>
  );
}
