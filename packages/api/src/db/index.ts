import { BunSqliteDialect } from "kysely-bun-sqlite";
import { Kysely, Migrator, FileMigrationProvider } from "kysely";
import { Database } from "bun:sqlite";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { env } from "../env";
import type { KyselyDatabase } from "./types.ts";

const dialect = new BunSqliteDialect({
  database: new Database(env.API_DATABASE),
});

export const db = new Kysely<KyselyDatabase>({
  dialect,
});

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }
}

migrateToLatest();
