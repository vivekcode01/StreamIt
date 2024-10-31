import { Elysia } from "elysia";
import { authUser } from "./token";
import { getAssetsTable } from "../repositories/assets";
import { getGroups } from "../repositories/groups";
import { AssetSchema } from "../types";
import { tableQuery, getTableObject } from "../utils/query-table";

export const assets = new Elysia()
  .use(authUser)
  .get(
    "/assets",
    async ({ query }) => {
      return await getAssetsTable(query);
    },
    {
      detail: {
        summary: "Get all assets",
        tags: ["Assets"],
      },
      query: tableQuery,
      response: {
        200: getTableObject(AssetSchema),
      },
    },
  )
  .get(
    "/groups",
    async () => {
      return await getGroups();
    },
    {
      detail: {
        summary: "Get all groups",
        tags: ["Assets"],
      },
    },
  );
