/* eslint-disable @typescript-eslint/no-explicit-any */

import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("users")
    // User
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("username", "text", (col) => col.notNull())
    .addColumn("password", "text", (col) => col.notNull())
    // Settings
    .addColumn("autoRefresh", "boolean", (col) => col.notNull().defaultTo(true))
    .execute();

  await db
    .insertInto("users")
    .values({
      username: "admin",
      password: await Bun.password.hash("admin"),
    })
    .execute();

  await db.schema
    .createTable("groups")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable("assets")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("groupId", "integer", (col) =>
      col.references("groups.id").onDelete("cascade"),
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("assets");
}
