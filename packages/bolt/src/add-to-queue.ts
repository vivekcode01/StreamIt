import { randomUUID } from "crypto";
import { FlowProducer } from "bullmq";
import { connection } from "./env";
import type { PackageData, PipelineData, TranscodeData } from "./queue";
import type { Job, JobsOptions, Queue } from "bullmq";

export const flowProducer = new FlowProducer({
  connection,
});

const DEFAULT_SEGMENT_SIZE = 2.24;

const DEFAULT_PACKAGE_NAME = "hls";

export async function addToQueue<Q extends Queue>(
  queue: Q,
  data: Q extends Queue<infer D> ? D : never,
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

  const options: JobsOptions = { ...params?.options };

  if (params?.parent?.id) {
    options.parent = {
      id: params.parent.id,
      queue: params.parent.queueQualifiedName,
    };
    options.failParentOnFailure = true;
  }

  const job = await queue.add(name, data, {
    removeOnComplete: {
      age: 60 * 10,
    },
    removeOnFail: {
      age: 3600 * 24 * 7,
    },
    ...options,
    jobId: `${queue.name}_${jobId}`,
  });

  if (!job.id) {
    throw new Error("Missing job.id");
  }

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

export function formatPipelineData(
  data: Omit<PartialBy<PipelineData, "assetId" | "segmentSize">, "package"> & {
    package?: boolean | PartialBy<NonNullable<PipelineData["package"]>, "name">;
  },
) {
  return {
    assetId: randomUUID(),
    segmentSize: DEFAULT_SEGMENT_SIZE,
    ...data,
    package: data.package
      ? {
          name: DEFAULT_PACKAGE_NAME,
          ...(typeof data.package === "boolean" ? undefined : data.package),
        }
      : undefined,
  };
}
