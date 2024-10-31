import { db } from "../db";
import type { AssetInsert } from "../db/types";

export async function createAsset(fields: AssetInsert) {
  return await db.insertInto("assets").values(fields).executeTakeFirstOrThrow();
}

export async function getAssetsCount() {
  const { count } = await db
    .selectFrom("assets")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .executeTakeFirstOrThrow();
  return count;
}

export async function getAssets(filter: {
  page: number;
  perPage: number;
  orderBy: string;
  direction: string;
}) {
  const orderBy = mapOrderBy(filter.orderBy);
  const direction = mapDirection(filter.direction);

  const assets = await db
    .selectFrom("assets")
    .leftJoin("playables", "playables.assetId", "assets.id")
    .select(({ fn }) => [
      "assets.id",
      "assets.groupId",
      "assets.createdAt",
      fn.count<number>("playables.assetId").as("playablesCount"),
    ])
    .groupBy("assets.id")
    .limit(filter.perPage)
    .offset((filter.page - 1) * filter.perPage)
    .orderBy(orderBy, direction)
    .execute();

  return assets.map((asset) => {
    return {
      ...asset,
      name: asset.id,
    };
  });
}

function mapOrderBy(orderBy: string) {
  if (orderBy === "name") {
    return "id";
  }
  if (orderBy === "createdAt") {
    return "createdAt";
  }
  return "createdAt";
}

function mapDirection(direction: string) {
  return direction === "asc" || direction === "desc" ? direction : "desc";
}
