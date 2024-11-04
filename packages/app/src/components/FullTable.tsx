import { Pagination } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useState } from "react";
import type { SortDescriptor } from "@nextui-org/table";
import type { UseNavigateResult } from "@tanstack/react-router";
import type { ReactNode } from "@tanstack/react-router";

export interface Column {
  id: string;
  label: string;
  allowsSorting?: boolean;
}

export interface Filter {
  page: number;
  perPage: number;
  sortKey: string | number;
  sortDirection: "ascending" | "descending";
}

interface FullTableProps<T, F extends Filter> {
  columns: Column[];
  items: T[];
  mapRow(props: T): ReactNode[];
  filter?: F;
  navigate?: UseNavigateResult<"">;
  totalPages?: number;
}

export function FullTable<T, F extends Filter>({
  columns,
  items,
  mapRow,
  filter,
  navigate,
  totalPages,
}: FullTableProps<T, F>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: filter?.sortKey,
    direction: filter?.sortDirection,
  });

  const updateFilter = (value: Record<string, string | number | undefined>) => {
    if (!filter) {
      return;
    }
    navigate?.({
      // @ts-expect-error Value is typed
      search: { ...filter, ...value },
    });
  };

  return (
    <div>
      <Table
        sortDescriptor={sortDescriptor ?? undefined}
        onSortChange={(sd) => {
          setSortDescriptor(sd);
          updateFilter({ sortKey: sd.column, sortDirection: sd.direction });
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.id} allowsSorting={column.allowsSorting}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const cells = mapRow(item);
            return (
              <TableRow key={index}>
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
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={(event) => {
                const perPage = Number(event.target.value);
                updateFilter({ perPage });
              }}
              defaultValue={filter.perPage.toString()}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </label>
          <Pagination
            total={totalPages}
            initialPage={filter.page}
            onChange={(page) => {
              updateFilter({ page });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
