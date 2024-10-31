// Originally based on https://github.com/charlie-hadden/kysely-paginate/blob/main/src/offset.ts

import type { SelectQueryBuilder } from "kysely";

export type OffsetPaginationResult<O> = {
  rows: O[];
  totalPages: number;
};

export async function executeWithPagination<O, DB, TB extends keyof DB>(
  qb: SelectQueryBuilder<DB, TB, O>,
  opts: {
    perPage: number;
    page: number;
  },
): Promise<OffsetPaginationResult<O>> {
  const data = await qb
    .clearSelect()
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  if (!("count" in data) || typeof data.count !== "string") {
    throw new Error("Could not count total rows");
  }

  const count = +data.count;
  if (!Number.isFinite(count)) {
    throw new Error("Count is not finite");
  }

  qb = qb.limit(opts.perPage).offset((opts.page - 1) * opts.perPage);

  const rows = await qb.execute();

  const totalPages = Math.ceil(count / opts.perPage);

  return {
    rows,
    totalPages,
  };
}
