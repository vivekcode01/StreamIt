import { z } from "../utils/zod";

export const userSchema = z
  .object({
    id: z.number(),
    username: z.string(),
  })
  .openapi({
    ref: "User",
  });
