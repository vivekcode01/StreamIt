import { FlowProducer } from "bullmq";
import { randomUUID } from "crypto";
import { connection } from "./env";
import type { DefaultJobOptions, JobsOptions, Queue } from "bullmq";

export const flowProducer = new FlowProducer({
  connection,
});

export const DEFAULT_JOB_OPTIONS: DefaultJobOptions = {
  removeOnComplete: {
    age: 3600 * 24 * 3,
    count: 200,
  },
  removeOnFail: {
    age: 3600 * 24 * 7,
  },
};

type QueueData<T> = T extends Queue<infer D> ? D : T;

export async function addToQueue<Q extends Queue, D = QueueData<Q>>(
  queue: Q,
  data: D,
  params?: {
    id?: string | string[];
    name?: string;
    options?: JobsOptions;
  },
) {
  let jobId = params?.id;
  if (Array.isArray(jobId)) {
    jobId = jobId.join("_");
  }

  if (!jobId) {
    jobId = randomUUID();
  }

  let name = queue.name;
  if (params?.name) {
    name = `${name}(${params.name})`;
  }

  const job = await queue.add(name, data, {
    jobId: `${queue.name}_${jobId}`,
    ...DEFAULT_JOB_OPTIONS,
    ...params?.options,
  });

  if (!job.id) {
    throw new Error("Missing job.id");
  }

  return job.id;
}
