import { z } from "zod";

export const getTokenResponseSchema = z.object({
  token: z.string(),
});
