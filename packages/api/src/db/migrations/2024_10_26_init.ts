/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("username", "text", (col) => col.notNull())
    .addColumn("password", "text", (col) => col.notNull())
    .addColumn("settingAutoRefetch", "boolean", (col) => col.defaultTo(true))
    .execute();

  await db
    .insertInto("user")
    .values({
      username: "admin",
      password: await Bun.password.hash("admin"),
    })
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("user").execute();
}
