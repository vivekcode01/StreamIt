import type { ColumnType, Generated, Insertable, Updateable } from "kysely";

export interface KyselyDatabase {
  users: UsersTable;
  groups: GroupsTable;
  assets: AssetsTable;
  playables: PlayablesTable;
}

export interface UsersTable {
  id: Generated<number>;
  username: string;
  password: string;
}

export type UserUpdate = Updateable<UsersTable>;

export interface GroupsTable {
  id: Generated<number>;
  name: string;
}

export type GroupInsert = Insertable<GroupsTable>;

export interface AssetsTable {
  id: string;
  name: string | null;
  groupId: number | null;
  createdAt: ColumnType<Date, never, never>;
}

export type AssetInsert = Insertable<AssetsTable>;

export type AssetUpdate = Updateable<AssetsTable>;

export interface PlayablesTable {
  assetId: string;
  name: string;
  createdAt: ColumnType<Date, never, never>;
}

export type PlayableInsert = Insertable<PlayablesTable>;
