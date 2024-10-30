import type { Generated, Updateable } from "kysely";

export interface KyselyDatabase {
  user: UserTable;
}

export interface UserTable {
  id: Generated<number>;
  username: string;
  password: string;
  autoRefresh: boolean;
}

export type UserUpdate = Updateable<UserTable>;
