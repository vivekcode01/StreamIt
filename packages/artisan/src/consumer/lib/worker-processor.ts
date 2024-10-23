import { Dir } from "./dir";
import type { Job } from "bullmq";

export type WorkerCallback<T, R> = (params: {
  job: Job<T, R>;
  token?: string | undefined;
  dir: Dir;
}) => Promise<R>;

export function createWorkerProcessor<T, R>(callback: WorkerCallback<T, R>) {
  const dir = new Dir();

  return async (job: Job<T, R>, token?: string) => {
    try {
      return await callback({ job, token, dir });
    } finally {
      await dir.deleteAll();
    }
  };
}
