import type { Generated, Selectable, Updateable } from "kysely";

export interface KyselyDatabase {
  user: UserTable;
}

export interface UserTable {
  id: Generated<number>;
  username: string;
  password: string;
}

export type User = Selectable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
