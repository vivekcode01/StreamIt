import { drizzle } from "drizzle-orm/node-postgres";
import { count } from "drizzle-orm";
import { env } from "../env";
import { users } from "./schema";

export const db = drizzle(env.DATABASE_URL);

async function setup() {
  const [result] = await db.select({ count: count() }).from(users);
  if (result?.count === 0) {
    const user: typeof users.$inferInsert = {
      username: "admin",
      password: await Bun.password.hash("admin"),
    };
    await db.insert(users).values(user);

    console.info('Created a default user "admin / admin"');
  }
}

setup();
