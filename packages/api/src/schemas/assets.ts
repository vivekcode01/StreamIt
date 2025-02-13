import { z } from "../utils/zod";

export const assetSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().nullable(),
    groupId: z.number().nullable(),
    createdAt: z.coerce.date(),
    playables: z.number(),
  })
  .openapi({
    ref: "Asset",
    description: "Each transcode result will be registered as an asset.",
  });

export const assetsPaginatedSchema = z.object({
  filter: z.object({
    page: z.number(),
    perPage: z.number(),
    sortKey: z.enum(["name", "playables", "groupId", "createdAt"]),
    sortDir: z.enum(["asc", "desc"]),
  }),
  items: z.array(assetSchema),
  totalPages: z.number(),
});

export const groupSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .openapi({
    ref: "Group",
    description: "Each asset can be part of a group for clarity.",
  });

export const groupsSchema = z.array(groupSchema);
