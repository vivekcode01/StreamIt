/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("assets").addColumn("name", "text").execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("assets").dropColumn("name").execute();
}
