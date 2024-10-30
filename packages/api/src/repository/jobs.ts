import {
  transcodeQueue,
  packageQueue,
  ffmpegQueue,
  ffprobeQueue,
  flowProducer,
} from "@superstreamer/artisan/producer";
import { Job as RawJob } from "bullmq";
import { isRecordWithNumbers } from "../helpers";
import type { JobNode, JobState, Queue } from "bullmq";
import type { Job } from "../models";

const allQueus = [transcodeQueue, packageQueue, ffmpegQueue, ffprobeQueue];

function findQueueByName(name: string): Queue {
  const queue = allQueus.find((queue) => queue.name === name);
  if (!queue) {
    throw new Error("No queue found.");
  }
  return queue;
}

function formatIdPair(id: string): [Queue, string] {
  const queueName = id.split("_", 1)[0];
  if (!queueName) {
    throw new Error("Missing queueName as prefix when formatting id pair");
  }
  return [findQueueByName(queueName), id];
}

export async function getJobs(): Promise<Job[]> {
  const result: Job[] = [];

  for (const queue of allQueus) {
    const jobs = await queue.getJobs();

    for (const job of jobs) {
      if (!job.id || job.parent) {
        continue;
      }
      const foundJob = await getJob(job.id, false);
      if (foundJob) {
        result.push(foundJob);
      }
    }
  }

  result.sort((a, b) => b.createdOn - a.createdOn);

  return result;
}

export async function getJob(
  id: string,
  fromRoot?: boolean,
): Promise<Job | null> {
  const node = await getJobNode(id, fromRoot);
  if (!node) {
    return null;
  }
  return await formatJobNode(node);
}

export async function getJobLogs(id: string): Promise<string[]> {
  const [queue, jobId] = formatIdPair(id);

  const { logs } = await queue.getJobLogs(jobId);

  return logs;
}

async function getJobNode(
  id: string,
  fromRoot?: boolean,
): Promise<JobNode | null> {
  const [queue, jobId] = formatIdPair(id);

  const rawJob = await RawJob.fromId(queue, jobId);

  let job = rawJob ?? null;
  if (!job) {
    return null;
  }

  if (fromRoot) {
    // If we want the root, resolve it and work with that as our job.
    job = await findRootJob(job);
  }

  if (!job?.id) {
    throw new Error("Found a child job but it has no parent.");
  }

  return await flowProducer.getFlow({
    id: job.id,
    queueName: job.queueName,
  });
}

async function findRootJob(job?: RawJob): Promise<RawJob | null> {
  if (!job) {
    return null;
  }

  while (job.parent) {
    const [queue, jobId] = formatIdPair(job.parent.id);
    const parentJob = await RawJob.fromId(queue, jobId);
    if (!parentJob) {
      throw new Error("No parent job found.");
    }
    job = parentJob;
  }

  return job;
}

async function formatJobNode(node: JobNode): Promise<Job> {
  const { job, children } = node;
  if (!job.id) {
    throw new Error("Missing job id");
  }

  const state = mapJobState(await job.getState());

  const failedReason = state === "failed" ? job.failedReason : undefined;

  const findParentSortIndex = (job: RawJob): number => {
    const value = job.data?.parentSortIndex;
    return typeof value === "number" ? value : 0;
  };
  (children ?? []).sort(
    (a, b) => findParentSortIndex(a.job) - findParentSortIndex(b.job),
  );

  const jobChildren = await Promise.all((children ?? []).map(formatJobNode));

  let processedOn = job.processedOn;
  if (processedOn) {
    for (const jobChild of jobChildren) {
      if (
        jobChild.processedOn &&
        processedOn !== undefined &&
        jobChild.processedOn < processedOn
      ) {
        processedOn = jobChild.processedOn;
      }
    }
  }

  const duration =
    state === "completed" && processedOn && job.finishedOn
      ? job.finishedOn - processedOn
      : undefined;

  let tag: string | undefined;
  const potentialTag = job.data?.tag;
  if (typeof potentialTag === "string") {
    tag = potentialTag;
  }

  let progress: Record<string, number> | undefined;
  if (isRecordWithNumbers(job.progress)) {
    progress = job.progress;
  }

  return {
    id: job.id,
    name: job.name,
    state,
    progress,
    duration,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    createdOn: job.timestamp,
    inputData: JSON.stringify(job.data),
    outputData: job.returnvalue ? JSON.stringify(job.returnvalue) : undefined,
    failedReason,
    tag,
    children: jobChildren,
  };
}

function mapJobState(jobState: JobState | "unknown"): Job["state"] {
  if (jobState === "active" || jobState === "waiting-children") {
    return "running";
  }
  if (jobState === "completed") {
    return "completed";
  }
  if (jobState === "failed") {
    return "failed";
  }
  return "waiting";
}
