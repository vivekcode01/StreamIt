import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { PagePaginationLink } from "@/components/PagePaginationLink";

type PaginationProps = {
  page: number;
  totalPages: number;
};

const ELLIPSIS_CONST = "...";

export function PagePagination({ page, totalPages }: PaginationProps) {
  const currentPage = page;
  const pages = getPaginationItems(currentPage, totalPages, 5);

  return (
    <Pagination>
      <PaginationContent>
        {pages.map((page, index) => {
          if (page === ELLIPSIS_CONST) {
            return (
              <PaginationItem key={`ellipsis${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          if (typeof page === "number") {
            return (
              <PaginationItem key={page}>
                <PagePaginationLink
                  to={`?page=${page}`}
                  isActive={page === currentPage}
                >
                  {page}
                </PagePaginationLink>
              </PaginationItem>
            );
          }
          return null;
        })}
      </PaginationContent>
    </Pagination>
  );
}

function getPaginationItems(
  page: number,
  totalPages: number,
  maxVisiblePages: number,
) {
  const surroundingPages = Math.floor((maxVisiblePages - 1) / 2);
  const pages: (string | number)[] = [];

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, page - surroundingPages);
    const endPage = Math.min(totalPages, page + surroundingPages);
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(ELLIPSIS_CONST);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(ELLIPSIS_CONST);
      }
      pages.push(totalPages);
    }
  }

  return pages;
}
