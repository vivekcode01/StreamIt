import { db } from "../db";
import type { AssetInsert, PlayableInsert } from "../db/types";

interface AssetsFilter {
  page: number;
  perPage: number;
  sortKey: "name" | "playables" | "groupId" | "createdAt";
  sortDir: "asc" | "desc";
}

export async function createAsset(fields: AssetInsert) {
  return await db.insertInto("assets").values(fields).executeTakeFirstOrThrow();
}

export async function getAssets(filter: AssetsFilter) {
  let orderBy: "id" | "playables" | "groupId" | "createdAt";
  if (filter.sortKey === "name") {
    orderBy = "id";
  } else {
    orderBy = filter.sortKey;
  }

  const items = await db
    .selectFrom("assets")
    .leftJoin("playables", "playables.assetId", "assets.id")
    .select(({ fn }) => [
      "assets.id",
      "assets.groupId",
      "assets.createdAt",
      fn.count<number>("playables.assetId").as("playables"),
    ])
    .groupBy("assets.id")
    .limit(filter.perPage)
    .offset((filter.page - 1) * filter.perPage)
    .orderBy(orderBy, filter.sortDir)
    .execute();

  const { count } = await db
    .selectFrom("assets")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .executeTakeFirstOrThrow();

  const totalPages = Math.ceil(count / filter.perPage);

  return {
    ...filter,
    items: items.map(formatAsset),
    totalPages,
  };
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

export async function getAsset(id: string) {
  const asset = await db
    .selectFrom("assets")
    .leftJoin("playables", "playables.assetId", "assets.id")
    .select(({ fn }) => [
      "assets.id",
      "assets.groupId",
      "assets.createdAt",
      fn.count<number>("playables.assetId").as("playables"),
    ])
    .groupBy("assets.id")
    .where("assets.id", "=", id)
    .executeTakeFirst();

  return asset ? formatAsset(asset) : null;
}

function formatAsset(asset: {
  id: string;
  groupId: number | null;
  createdAt: Date;
  playables: number;
}) {
  return {
    ...asset,
    name: asset.id,
  };
}
