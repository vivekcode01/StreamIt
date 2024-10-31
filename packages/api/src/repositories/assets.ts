import { db } from "../db";
import { executeAsTable } from "../utils/query-table";
import type { AssetInsert } from "../db/types";
import type { TableQuery } from "../utils/query-table";

export async function createAsset(fields: AssetInsert) {
  return await db.insertInto("assets").values(fields).executeTakeFirstOrThrow();
}

export async function getAssetsTable(query: TableQuery) {
  return await executeAsTable(
    query,
    db
      .selectFrom("assets")
      .leftJoin("playables", "playables.assetId", "assets.id")
      .select(({ fn }) => [
        "assets.id",
        "assets.groupId",
        "assets.createdAt",
        fn.count<number>("playables.assetId").as("playablesCount"),
      ])
      .groupBy("assets.id"),
  );
}
