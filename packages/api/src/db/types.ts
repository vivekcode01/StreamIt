import type { Generated, Insertable, Updateable } from "kysely";

export interface KyselyDatabase {
  users: UsersTable;
  assets: AssetsTable;
}

export interface UsersTable {
  id: Generated<number>;
  username: string;
  password: string;
  autoRefresh: boolean;
}

export type UserUpdate = Updateable<UsersTable>;

export interface AssetsTable {
  id: string;
}

export type AssetInsert = Insertable<AssetsTable>;
