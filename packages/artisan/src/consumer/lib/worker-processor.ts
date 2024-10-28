import { Dir } from "./dir";
import { ProgressTracker } from "./progress-tracker";
import type { Job } from "bullmq";

export type WorkerCallback<T, R> = (params: {
  job: Job<T, R>;
  token: string | undefined;
  dir: Dir;
  progressTracker: ProgressTracker;
}) => Promise<R>;

export function createWorkerProcessor<T, R>(callback: WorkerCallback<T, R>) {
  return async (job: Job<T, R>, token?: string) => {
    const dir = new Dir();
    const progressTracker = new ProgressTracker(job);

    try {
      return await callback({ job, token, dir, progressTracker });
    } finally {
      await progressTracker.finish();
      await dir.deleteAll();
    }
  };
}
