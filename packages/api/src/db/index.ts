import { Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { env } from "../env";
import type { KyselyDatabase } from "./types.ts";

export const db = new Kysely<KyselyDatabase>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: env.DATABASE }),
  }),
});

types.setTypeParser(/* INT8_TYPE_ID= */ 20, (val) => {
  return parseInt(val, 10);
});
