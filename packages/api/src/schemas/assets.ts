import { z } from "zod";

const assetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  groupId: z.number().nullable(),
  createdAt: z.coerce.date(),
  playables: z.number(),
});

export const getAssetResponseSchema = assetSchema;

export const getAssetsResponseSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  sortKey: z.enum(["name", "playables", "groupId", "createdAt"]),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  items: z.array(assetSchema),
  totalPages: z.number(),
});

export const getGroupsResponseSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
  }),
);

export const getGroupResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});
