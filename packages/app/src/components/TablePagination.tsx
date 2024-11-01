import ChevronLeft from "lucide-react/icons/chevron-left";
import ChevronRight from "lucide-react/icons/chevron-right";
import ChevronsLeft from "lucide-react/icons/chevrons-left";
import ChevronsRight from "lucide-react/icons/chevrons-right";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onSelect(page: number): void;
}

export function TablePagination({
  page,
  totalPages,
  onSelect,
}: TablePaginationProps) {
  const buttons = [
    {
      disabled: page === 1,
      icon: <ChevronsLeft className="w-4 h-4" />,
      page: 1,
    },
    {
      disabled: page === 1,
      icon: <ChevronLeft className="w-4 h-4" />,
      page: page - 1,
    },
    {
      disabled: page === totalPages,
      icon: <ChevronRight className="w-4 h-4" />,
      page: page + 1,
    },
    {
      disabled: page === totalPages,
      icon: <ChevronsRight className="w-4 h-4" />,
      page: totalPages,
    },
  ];

  return (
    <div className="flex items-center">
      <div className="mr-6 text-medium text-sm">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-1">
        {buttons.map((button, index) => {
          return (
            <Button
              key={index}
              className="w-8 h-8 p-0"
              variant="outline"
              disabled={button.disabled}
              onClick={() => onSelect(button.page)}
            >
              {button.icon}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
