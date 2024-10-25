import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

export async function getUserIdCredentials(username: string, password: string) {
  const [user] = await db
    .select({
      id: users.id,
      password: users.password,
    })
    .from(users)
    .where(eq(users.username, username));

  if (user && (await Bun.password.verify(password, user.password))) {
    return user.id;
  }

  return null;
}
