import { t } from "elysia";
import type { SelectQueryBuilder, TableNode } from "kysely";
import type { Static, TSchema } from "elysia";
import { db } from "../db";

export type TableResult<O> = {
  rows: O[];
  totalPages: number;
};

export const tableQuery = t.Object({
  page: t.Number(),
  perPage: t.Number(),
  sort: t.String(),
});

export type TableQuery = Static<typeof tableQuery>;

export function getTableObject<T extends TSchema>(schema: T) {
  return t.Object({
    page: t.Number(),
    totalPages: t.Number(),
    rows: t.Array(schema),
  });
}

export async function executeAsTable<O, DB, TB extends keyof DB>(
  query: TableQuery,
  qb: SelectQueryBuilder<DB, TB, O>,
) {
  const from = qb.toOperationNode().from?.froms[0] as TableNode;

  const { count } = await db
    // @ts-expect-error Table string
    .selectFrom(from.table.identifier.name)
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .executeTakeFirstOrThrow();

  const [sortKey, sortMode] = query.sort.split(":");

  const rows = await qb
    .limit(query.perPage)
    .offset((query.page - 1) * query.perPage)
    // @ts-expect-error map sortKey
    .orderBy(sortKey, sortMode)
    .execute();

  const totalPages = Math.ceil(count / query.perPage);

  return {
    page: query.page,
    totalPages,
    rows,
  };
}
