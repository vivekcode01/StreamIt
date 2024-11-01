import * as fs from "node:fs/promises";
import * as path from "node:path";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from ".";

/*
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
*/

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

  console.log(`Ran ${results?.length ?? 0} migrations`);

  await db.destroy();
}

migrateToLatest();
