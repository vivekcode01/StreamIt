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
import { jobSchema, jobsPaginatedSchema } from "../schemas/jobs";
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

export const jobsApp = new Hono()
  .use(auth())

  /**
   * Push a pipeline job,
   * a combination of a transcode and package job with sane defaults.
   */
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

  /**
   * Push a transcode job.
   */
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

  /**
   * Push a package job.
   */
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

  /**
   * Get a list of jobs.
   */
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
              schema: resolver(jobsPaginatedSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        page: z.coerce.number().default(1),
        perPage: z.coerce.number().default(20),
        sortKey: z.enum(["name", "duration", "createdAt"]).default("createdAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      }),
    ),
    async (c) => {
      const filter = c.req.valid("query");
      const { items, totalPages } = await getJobs(filter);
      return c.json(
        {
          filter,
          items,
          totalPages,
        },
        200,
      );
    },
  )

  /**
   * Get a job by id.
   */
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
        fromRoot: z.coerce.boolean().default(false),
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

  /**
   * Get a list of job logs by job id.
   */
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
