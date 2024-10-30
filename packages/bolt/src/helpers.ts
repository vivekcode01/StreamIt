import { FlowProducer } from "bullmq";
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
  jobId: string | string[],
  options?: JobsOptions,
) {
  if (Array.isArray(jobId)) {
    jobId = jobId.join("_");
  }
  return await queue.add(queue.name, data, {
    jobId: `${queue.name}_${jobId}`,
    ...DEFAULT_JOB_OPTIONS,
    ...options,
  });
}
