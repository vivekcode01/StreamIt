import {
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import type { SortDescriptor } from "@heroui/react";
import type { ReactNode } from "react";

export interface FullTableFilter {
  page: number;
  perPage: number;
  sortKey: string;
  sortDir: "asc" | "desc";
}

export interface FullTableColumn {
  id: string;
  label: string;
  allowsSorting?: boolean;
  className?: string;
}

interface FullTableProps<T, F extends FullTableFilter> {
  columns: FullTableColumn[];
  items: T[];
  mapRow(props: T): { key: string; cells: ReactNode[] };
  filter: F;
  onFilterChange(filter: F): void;
  totalPages: number;
}

export function FullTable<T, F extends FullTableFilter>({
  columns,
  items,
  mapRow,
  filter,
  onFilterChange,
  totalPages,
}: FullTableProps<T, F>) {
  const sortDescriptor: SortDescriptor = {
    column: filter.sortKey,
    direction: filter.sortDir === "asc" ? "ascending" : "descending",
  };

  const updateFilter = (fields: Partial<FullTableFilter>) => {
    onFilterChange({ ...filter, ...fields });
  };

  return (
    <>
      <Table
        aria-label="table"
        sortDescriptor={sortDescriptor}
        onSortChange={(sd) => {
          updateFilter({
            sortKey: sd.column.toString(),
            sortDir: sd.direction === "ascending" ? "asc" : "desc",
          });
        }}
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
    </>
  );
}
