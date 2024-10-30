import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "../env";
import type { KyselyDatabase } from "./types.ts";

export const db = new Kysely<KyselyDatabase>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: env.DATABASE }),
  }),
});
