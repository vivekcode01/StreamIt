import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import type { TableProps } from "@heroui/react";
import type { ReactNode } from "react";

export interface FullTableScrollColumn {
  id: string;
  label: string;
  allowsSorting?: boolean;
  className?: string;
}

interface FullTableScrollProps<T> {
  classNames?: TableProps["classNames"];
  columns: FullTableScrollColumn[];
  items: T[];
  mapRow(props: T): { key: string; cells: ReactNode[] };
  hasMore?: boolean;
  onLoadMore?(): void;
}

export function FullTableScroll<T>({
  classNames,
  columns,
  items,
  mapRow,
  hasMore,
  onLoadMore,
}: FullTableScrollProps<T>) {
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    onLoadMore,
  });

  return (
    <Table
      aria-label="table"
      classNames={classNames}
      baseRef={scrollerRef}
      bottomContent={hasMore ? <Spinner ref={loaderRef} /> : null}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.id}
            allowsSorting={column.allowsSorting}
            className={column.className}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const { cells, key } = mapRow(item);
          return (
            <TableRow key={key}>
              {cells.map((cell, index) => {
                return <TableCell key={index}>{cell}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
