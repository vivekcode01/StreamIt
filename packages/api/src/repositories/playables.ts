import { db } from "../db";
import type { PlayableInsert } from "../db/types";

export async function createPlayable(fields: PlayableInsert) {
  return await db
    .insertInto("playables")
    .values(fields)
    .executeTakeFirstOrThrow();
}
