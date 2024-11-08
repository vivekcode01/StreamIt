import { randomUUID } from "crypto";
import { FlowProducer } from "bullmq";
import { connection } from "./env";
import type { PackageData, TranscodeData } from "./queue";
import type { DefaultJobOptions, Job, JobsOptions, Queue } from "bullmq";

export const flowProducer = new FlowProducer({
  connection,
});

const DEFAULT_SEGMENT_SIZE = 2.24;

const DEFAULT_PACKAGE_NAME = "hls";

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
    parent?: Job;
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

  let parent: JobsOptions["parent"];
  if (params?.parent?.id) {
    parent = {
      id: params.parent.id,
      queue: params.parent.queueQualifiedName,
    };
  }

  const job = await queue.add(name, data, {
    jobId: `${queue.name}_${jobId}`,
    ...DEFAULT_JOB_OPTIONS,
    parent,
    ...params?.options,
  });

  if (!job.id) {
    throw new Error("Missing job.id");
  }

  // Wait 1ms to ensure we increase timestamp if we add jobs
  // from a list.
  await Bun.sleep(1);

  return job.id;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function formatTranscodeData(
  data: PartialBy<TranscodeData, "assetId" | "segmentSize">,
) {
  return {
    assetId: randomUUID(),
    segmentSize: DEFAULT_SEGMENT_SIZE,
    ...data,
  };
}

export function formatPackageData(data: PartialBy<PackageData, "name">) {
  return {
    name: DEFAULT_PACKAGE_NAME,
    ...data,
  };
}
