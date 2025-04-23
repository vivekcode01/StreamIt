import type { Kysely } from "kysely";

// biome-ignore lint/suspicious/noExplicitAny: Use any
export async function up(db: Kysely<any>) {
  await db.schema.alterTable("assets").addColumn("name", "text").execute();
}

// biome-ignore lint/suspicious/noExplicitAny: Use any
export async function down(db: Kysely<any>) {
  await db.schema.alterTable("assets").dropColumn("name").execute();
}
