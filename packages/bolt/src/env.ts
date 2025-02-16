import { z } from "zod";

export const env = z
  .object({
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
  })
  .parse(Bun.env);
