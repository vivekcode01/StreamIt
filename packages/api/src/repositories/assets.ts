import { db } from "../db";
import type { AssetInsert } from "../db/types";

export async function createAsset(fields: AssetInsert) {
  return await db.insertInto("assets").values(fields).executeTakeFirstOrThrow();
}
