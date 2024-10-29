import {
  Kysely,
  Migrator,
  FileMigrationProvider,
  PostgresDialect,
} from "kysely";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { Pool } from "pg";
import { env } from "../env";
import type { KyselyDatabase } from "./types.ts";

export const db = new Kysely<KyselyDatabase>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: env.DATABASE }),
  }),
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
