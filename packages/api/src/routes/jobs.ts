import { randomUUID } from "crypto";
import {
  addToQueue,
  DEFAULT_CONCURRENCY,
  DEFAULT_PACKAGE_NAME,
  DEFAULT_PUBLIC,
  DEFAULT_SEGMENT_SIZE,
  packageQueue,
  pipelineQueue,
  transcodeQueue,
} from "bolt";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { apiError } from "../errors";
import { auth } from "../middleware";
import { getJob, getJobLogs, getJobs } from "../repositories/jobs";
import { validator } from "../validator";

const inputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    path: z.string(),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal("audio"),
    path: z.string(),
    language: z.string().optional(),
    channels: z.number().optional(),
  }),
  z.object({
    type: z.literal("text"),
    path: z.string(),
    language: z.string(),
  }),
]);

const streamSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    codec: z.enum(["h264", "vp9", "hevc"]),
    height: z.number(),
    bitrate: z.number().optional(),
    framerate: z.number().optional(),
  }),
  z.object({
    type: z.literal("audio"),
    codec: z.enum(["aac", "ac3", "eac3"]),
    bitrate: z.number().optional(),
    language: z.string().optional(),
    channels: z.number().optional(),
  }),
  z.object({
    type: z.literal("text"),
    language: z.string(),
  }),
]);

const jobSchema = z.object({
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
  children: z.array(z.any()),
});

const jobsFilterSchema = z.object({
  page: z.number().default(1),
  perPage: z.number().default(20),
  sortKey: z.enum(["name", "duration", "createdAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const jobsApp = new Hono()
  .use(auth())
  .post(
    "/pipeline",
    describeRoute({
      summary: "Create pipeline job",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  jobId: z.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator(
      "json",
      z.object({
        assetId: z.string().uuid().default(randomUUID),
        inputs: z.array(inputSchema),
        streams: z.array(streamSchema),
        group: z.string().optional(),
        language: z.string().optional(),
        concurrency: z.number().default(DEFAULT_CONCURRENCY),
        public: z.boolean().default(DEFAULT_PUBLIC),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      const jobId = await addToQueue(pipelineQueue, {
        ...body,
        segmentSize: DEFAULT_SEGMENT_SIZE,
        name: DEFAULT_PACKAGE_NAME,
      });

      return c.json({ jobId }, 200);
    },
  )
  .post(
    "/transcode",
    describeRoute({
      summary: "Create transcode job",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  jobId: z.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator(
      "json",
      z.object({
        assetId: z.string().uuid().default(randomUUID),
        segmentSize: z.number().default(DEFAULT_SEGMENT_SIZE),
        inputs: z.array(inputSchema),
        streams: z.array(streamSchema),
        group: z.string().optional(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      const jobId = await addToQueue(transcodeQueue, body, {
        id: body.assetId,
      });

      return c.json({ jobId }, 200);
    },
  )
  .post(
    "/package",
    describeRoute({
      summary: "Create package job",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  jobId: z.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator(
      "json",
      z.object({
        assetId: z.string().uuid().default(randomUUID),
        segmentSize: z.number().default(DEFAULT_SEGMENT_SIZE),
        name: z.string().default(DEFAULT_PACKAGE_NAME),
        language: z.string().optional(),
        concurrency: z.number().default(DEFAULT_CONCURRENCY),
        public: z.boolean().default(DEFAULT_PUBLIC),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      const jobId = await addToQueue(packageQueue, body, {
        id: [body.assetId, body.name],
      });

      return c.json({ jobId }, 200);
    },
  )
  .get(
    "/",
    describeRoute({
      summary: "Get all jobs",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.intersection(
                  jobsFilterSchema,
                  z.object({
                    items: z.array(jobSchema),
                    totalPages: z.number(),
                  }),
                ),
              ),
            },
          },
        },
      },
    }),
    validator("query", jobsFilterSchema),
    async (c) => {
      const query = c.req.valid("query");
      const jobs = await getJobs(query);
      return c.json(jobs, 200);
    },
  )
  .get(
    "/:id",
    describeRoute({
      summary: "Get a job",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(jobSchema),
            },
          },
        },
      },
    }),
    validator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    validator(
      "query",
      z.object({
        fromRoot: z.boolean().default(false),
      }),
    ),
    async (c) => {
      const params = c.req.valid("param");
      const query = c.req.valid("query");
      const job = await getJob(params.id, query.fromRoot);
      if (!job) {
        throw apiError("ERR_JOB_NOT_FOUND");
      }
      return c.json(job, 200);
    },
  )
  .get(
    "/:id/logs",
    describeRoute({
      summary: "Get job logs",
      security: [{ userToken: [] }],
      tags: ["Jobs"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(z.array(z.string())),
            },
          },
        },
      },
    }),
    validator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const params = c.req.valid("param");
      const logs = await getJobLogs(params.id);
      return c.json(logs, 200);
    },
  );
