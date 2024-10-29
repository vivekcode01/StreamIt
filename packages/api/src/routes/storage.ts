import { Elysia, t } from "elysia";
import { user } from "./auth";
import { getStorageFolder, getStorageFile } from "../s3";
import { StorageFolderSchema, StorageFileSchema } from "../types";

export const storage = new Elysia()
  .use(user)
  .get(
    "/storage/folder",
    async ({ query }) => {
      return await getStorageFolder(query.path, query.take, query.cursor);
    },
    {
      detail: {
        summary: "Get a storage folder",
        description:
          "Get a folder from your S3 storage by path with all files and subfolders.",
      },
      query: t.Object({
        path: t.String(),
        cursor: t.Optional(t.String()),
        take: t.Optional(t.Number()),
      }),
      response: {
        200: t.Ref(StorageFolderSchema),
      },
    },
  )
  .get(
    "/storage/file",
    async ({ query }) => {
      return await getStorageFile(query.path);
    },
    {
      detail: {
        summary: "Get a storage file",
        description: "Get a single file from storage with raw data.",
      },
      query: t.Object({
        path: t.String(),
      }),
      response: {
        200: t.Ref(StorageFileSchema),
      },
    },
  );
