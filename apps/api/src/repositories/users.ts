import { db } from "../db";

/**
 * Get a user id by username and password.
 * @param name
 * @param password
 * @returns
 */
export async function getUserIdByCredentials(name: string, password: string) {
  const user = await db
    .selectFrom("users")
    .select(["id", "password"])
    .where("username", "=", name)
    .executeTakeFirst();

  if (!user) {
    return null;
  }

  const match = await Bun.password.verify(password, user.password);
  if (!match) {
    return null;
  }

  return user.id;
}

/**
 * Get a user by id.
 * @param id
 * @returns
 */
export async function getUser(id: number) {
  return await db
    .selectFrom("users")
    .select(["id", "username"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
