import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { apiError } from "../errors";
import { auth } from "../middleware";
import {
  getStorageFileResponseSchema,
  getStorageFolderResponseSchema,
} from "../schemas/storage";
import {
  getStorageFilePayload,
  getStorageFileUrl,
  getStorageFolder,
} from "../utils/s3";
import { validator } from "../validator";

export const storageApp = new Hono()
  .use(auth())
  .get(
    "/folder",
    describeRoute({
      summary: "Get a storage folder",
      description:
        "Get a folder from your S3 storage by path with all files and subfolders.",
      security: [{ userToken: [] }],
      tags: ["Storage"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(getStorageFolderResponseSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        path: z.string(),
        take: z.coerce.number().default(10),
        cursor: z.string().optional(),
      }),
    ),
    async (c) => {
      const { path, take, cursor } = c.req.valid("query");
      const folder = await getStorageFolder(path, take, cursor);
      return c.json(folder, 200);
    },
  )
  .get(
    "/file",
    describeRoute({
      summary: "Get a file",
      description: "Get a file from your S3 storage by path.",
      security: [{ userToken: [] }],
      tags: ["Storage"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(getStorageFileResponseSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        path: z.string(),
      }),
    ),
    async (c) => {
      const { path } = c.req.valid("query");
      const ext = path.split(".").pop();
      switch (ext) {
        case "m4v":
        case "mp4":
        case "mkv":
          return c.json(
            {
              mode: "url",
              url: await getStorageFileUrl(path),
              type: "video",
            },
            200,
          );
        case "m4a":
        case "mp3":
          return c.json(
            {
              mode: "url",
              url: await getStorageFileUrl(path),
              type: "audio",
            },
            200,
          );
        case "m3u8":
        case "json":
        case "vtt":
          return c.json(
            {
              mode: "payload",
              payload: await getStorageFilePayload(path),
            },
            200,
          );
        default:
          throw apiError("ERR_STORAGE_NO_FILE_PREVIEW");
      }
    },
  );
