import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { URLSearchParamsInit } from "react-router-dom";

export interface TableFilterValue {
  page: number;
  perPage: number;
  orderBy: string;
  direction: string;
}

export function useTableFilter(defaultValue: TableFilterValue) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState(() => parse(searchParams, defaultValue));

  useEffect(() => {
    setSearchParams(stringify(filter));
  }, [filter]);

  const updateFilter = (value: Partial<TableFilterValue>) => {
    setFilter((old) => ({ ...old, ...value }));
  };

  return { filter, updateFilter };
}

function parse(
  searchParams: URLSearchParams,
  defaultValue: TableFilterValue,
): TableFilterValue {
  const filter = defaultValue;
  searchParams.entries().forEach(([key, value]) => {
    if (key === "page" || key === "perPage") {
      filter[key] = Number.parseInt(value);
    } else if (key === "orderBy" || key === "direction") {
      filter[key] = value;
    }
  });
  return filter;
}

function stringify(value: TableFilterValue) {
  const params: URLSearchParamsInit = {};
  Object.entries(value).forEach(([key, value]) => {
    params[key] = value.toString();
  });
  return params;
}
