import { z } from "zod";

export const getUserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
});
