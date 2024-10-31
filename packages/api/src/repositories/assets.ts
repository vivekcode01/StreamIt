import { db } from "../db";
import { executeWithPagination } from "../utils/query-paginate";
import type { AssetInsert } from "../db/types";

export async function createAsset(fields: AssetInsert) {
  return await db.insertInto("assets").values(fields).executeTakeFirstOrThrow();
}

export async function getAssets(page: number, perPage: number) {
  const query = db.selectFrom("assets").select(["id", "groupId", "createdAt"]);
  return await executeWithPagination(query, {
    page,
    perPage,
  });
}
