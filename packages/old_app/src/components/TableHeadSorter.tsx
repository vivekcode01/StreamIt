import ArrowDown from "lucide-react/icons/arrow-down";
import ArrowUp from "lucide-react/icons/arrow-up";
import ChevronsUpDown from "lucide-react/icons/chevrons-up-down";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";

interface TableHeadSorterProps {
  name: string;
  children: ReactNode;
  orderBy: string;
  direction: string;
  onChange(orderBy: string, duration: string): void;
}

export function TableHeadSorter({
  name,
  children,
  orderBy,
  direction,
  onChange,
}: TableHeadSorterProps) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        className="-ml-2 px-2 flex gap-2 text-xs h-6"
        onClick={() => {
          onChange(name, direction === "asc" ? "desc" : "asc");
        }}
      >
        {children}
        {orderBy === name ? (
          getArrow(direction)
        ) : (
          <ChevronsUpDown className="w-3 h-3" />
        )}
      </Button>
    </TableHead>
  );
}

function getArrow(direction: string) {
  if (direction === "asc") {
    return <ArrowUp className="w-3 h-3" />;
  }
  if (direction === "desc") {
    return <ArrowDown className="w-3 h-3" />;
  }
  return null;
}
