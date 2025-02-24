import { z } from "../utils/zod";

const baseJobSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(["waiting", "running", "failed", "completed"]),
  progress: z.record(z.string(), z.number()).optional(),
  createdAt: z.number(),
  processedAt: z.number().optional(),
  finishedAt: z.number().optional(),
  duration: z.number().optional(),
  inputData: z.string(),
  outputData: z.string().optional(),
  failedReason: z.string().optional(),
  stacktrace: z.array(z.string()).optional(),
});

type Job = z.infer<typeof baseJobSchema> & {
  children: Job[];
};

export const jobSchema: z.ZodType<Job> = baseJobSchema
  .extend({
    children: z
      .lazy(() => jobSchema.array())
      .openapi({
        type: "array",
        items: {
          $ref: "#/components/schemas/Job",
        },
      }),
  })
  .openapi({
    ref: "Job",
    description: "A single job.",
  });

export const jobsPaginatedSchema = z.object({
  filter: z.object({
    page: z.number(),
    perPage: z.number(),
    sortKey: z.enum(["name", "duration", "createdAt"]),
    sortDir: z.enum(["asc", "desc"]),
    query: z.string(),
  }),
  items: z.array(jobSchema),
  totalPages: z.number(),
});
