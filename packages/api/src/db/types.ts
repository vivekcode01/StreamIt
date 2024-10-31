import type { Generated, Insertable, Updateable, ColumnType } from "kysely";

export interface KyselyDatabase {
  users: UsersTable;
  groups: GroupsTable;
  assets: AssetsTable;
}

export interface UsersTable {
  id: Generated<number>;
  username: string;
  password: string;
  autoRefresh: boolean;
}

export type UserUpdate = Updateable<UsersTable>;

export interface GroupsTable {
  id: Generated<number>;
  name: string;
}

export type GroupInsert = Insertable<GroupsTable>;

export interface AssetsTable {
  id: string;
  groupId: number | null;
  createdAt: ColumnType<Date, never, never>;
}

export type AssetInsert = Insertable<AssetsTable>;
