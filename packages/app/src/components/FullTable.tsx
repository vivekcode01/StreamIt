import { Pagination, Spinner } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useState } from "react";
import type { SortDescriptor, TableProps } from "@heroui/table";
import type { ReactNode } from "@tanstack/react-router";

export interface Column {
  id: string;
  label: string;
  allowsSorting?: boolean;
  className?: string;
}

export interface Filter {
  page: number;
  perPage: number;
  sortKey: string | number;
  sortDir: "asc" | "desc";
}

interface FullTableProps<T, F extends Filter> {
  classNames?: TableProps["classNames"];
  columns: Column[];
  items: T[];
  mapRow(props: T): { key: string | number; cells: ReactNode[] };
  filter?: F;
  onFilterChange?(filter: F): void;
  hasMore?: boolean;
  onLoadMore?(): void;
  totalPages?: number;
}

export function FullTable<T, F extends Filter>({
  classNames,
  columns,
  items,
  mapRow,
  filter,
  onFilterChange,
  hasMore,
  onLoadMore,
  totalPages,
}: FullTableProps<T, F>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: filter?.sortKey ?? "",
    direction: filter?.sortDir === "asc" ? "ascending" : "descending",
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    onLoadMore,
  });

  const updateFilter = (value: Record<string, string | number | undefined>) => {
    if (onFilterChange && filter) {
      onFilterChange({ ...filter, ...value });
    }
  };

  return (
    <>
      <Table
        classNames={classNames}
        baseRef={scrollerRef}
        sortDescriptor={sortDescriptor ?? undefined}
        onSortChange={(sd) => {
          setSortDescriptor(sd);
          updateFilter({
            sortKey: sd.column,
            sortDir: sd.direction === "ascending" ? "asc" : "desc",
          });
        }}
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
      {filter && totalPages !== undefined ? (
        <div className="flex items-center gap-4 mt-4">
          <Select
            label="Rows per page"
            className="max-w-[140px]"
            selectionMode="single"
            size="sm"
            selectedKeys={[filter.perPage.toString()]}
            onSelectionChange={(values) => {
              if (values.currentKey) {
                updateFilter({ perPage: +values.currentKey });
              }
            }}
            items={[{ key: "10" }, { key: "20" }, { key: "30" }]}
          >
            {(item) => <SelectItem key={item.key}>{item.key}</SelectItem>}
          </Select>
          <Pagination
            total={totalPages}
            initialPage={filter.page}
            onChange={(page) => {
              updateFilter({ page });
            }}
          />
        </div>
      ) : null}
    </>
  );
}
