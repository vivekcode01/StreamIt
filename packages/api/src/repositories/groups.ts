import { db } from "../db";

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
