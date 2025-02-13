import { z } from "../utils/zod";

export const storageItemSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("file"),
      path: z.string(),
      size: z.number(),
    }),
    z.object({
      type: z.literal("folder"),
      path: z.string(),
    }),
  ])
  .openapi({
    ref: "StorageItem",
    description: "An item in your S3 storage.",
  });

export const storageItemsPaginatedSchema = z.object({
  cursor: z.string().optional(),
  items: z.array(storageItemSchema),
});

export const storageFileSchema = z
  .discriminatedUnion("mode", [
    z.object({
      mode: z.literal("url"),
      type: z.enum(["video", "audio"]),
      url: z.string(),
    }),
    z.object({
      mode: z.literal("payload"),
      payload: z.string(),
    }),
  ])
  .openapi({
    ref: "StorageFile",
    description: "A single file in your S3 storage.",
  });
