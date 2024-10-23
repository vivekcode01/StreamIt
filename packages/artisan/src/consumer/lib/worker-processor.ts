import { TmpDir } from "./tmp-dir";
import type { Job } from "bullmq";

export type WorkerCallback<T, R> = (params: {
  job: Job<T, R>;
  token?: string | undefined;
  tmpDir: TmpDir;
}) => Promise<R>;

export function createWorkerProcessor<T, R>(callback: WorkerCallback<T, R>) {
  const tmpDir = new TmpDir();

  return async (job: Job<T, R>, token?: string) => {
    try {
      return await callback({ job, token, tmpDir });
    } finally {
      await tmpDir.deleteAll();
    }
  };
}
