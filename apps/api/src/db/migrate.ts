import * as fs from "node:fs/promises";
import * as path from "node:path";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from ".";

/*
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
*/

async function migrateToLatest() {
  const migrationFolder = path.join(import.meta.dir, "migrations");

  console.log("Reading migrations from folder", migrationFolder);

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  const allResults = results ?? [];
  for (const it of allResults) {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  };

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }

  console.log(`Ran ${results?.length ?? 0} migrations`);
}

migrateToLatest();
