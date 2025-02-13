import { z } from "zod";

export const unstable_storageFolder = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("file"),
    path: z.string(),
    size: z.number(),
  }),
  z.object({
    type: z.literal("folder"),
    path: z.string(),
  }),
]);

export const getStorageFolderResponseSchema = z.object({
  cursor: z.string().optional(),
  items: z.array(unstable_storageFolder),
});

export const getStorageFileResponseSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("url"),
    type: z.enum(["video", "audio"]),
    url: z.string(),
  }),
  z.object({
    mode: z.literal("payload"),
    payload: z.string(),
  }),
]);
