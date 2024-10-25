import { drizzle } from "drizzle-orm/node-postgres";
import { count } from "drizzle-orm";
import { env } from "../env";
import { usersTable } from "./schema";

export const db = drizzle(env.DATABASE_URL);

async function setup() {
  const [result] = await db.select({ count: count() }).from(usersTable);
  if (!result || result.count > 0) {
    return;
  }

  // TODO: Insert user with password
}

setup();
