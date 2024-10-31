import { Button } from "@/components/ui/button";
import ChevronLeft from "lucide-react/icons/chevron-left";
import ChevronsLeft from "lucide-react/icons/chevrons-left";
import ChevronRight from "lucide-react/icons/chevron-right";
import ChevronsRight from "lucide-react/icons/chevrons-right";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  onSelect(page: number): void;
};

export function TablePagination({
  page,
  totalPages,
  onSelect,
}: TablePaginationProps) {
  return (
    <div className="flex items-center">
      <div className="mr-6 text-medium text-sm">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-1">
        <Button
          className="w-8 h-8 p-0"
          variant="outline"
          disabled={page === 1}
          onClick={() => onSelect(1)}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          className="w-8 h-8 p-0"
          variant="outline"
          disabled={page === 1}
          onClick={() => onSelect(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          className="w-8 h-8 p-0"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onSelect(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          className="w-8 h-8 p-0"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onSelect(totalPages)}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
