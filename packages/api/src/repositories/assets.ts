import { db } from "../db";
import type { AssetInsert, PlayableInsert } from "../db/types";

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

export async function getGroups() {
  return await db.selectFrom("groups").select(["id", "name"]).execute();
}

export async function getOrCreateGroup(name: string) {
  let group = await db
    .selectFrom("groups")
    .select(["id", "name"])
    .where("name", "=", name)
    .executeTakeFirst();
  if (!group) {
    group = await db
      .insertInto("groups")
      .values({ name })
      .returning(["id", "name"])
      .executeTakeFirstOrThrow();
  }
  return group;
}

export async function createPlayable(fields: PlayableInsert) {
  return await db
    .insertInto("playables")
    .values(fields)
    .executeTakeFirstOrThrow();
}

function mapOrderBy(orderBy: string) {
  if (orderBy === "name") {
    return "id";
  }
  return "createdAt";
}

function mapDirection(direction: string) {
  if (direction === "asc" || direction === "desc") {
    return direction;
  }
  return "desc";
}
