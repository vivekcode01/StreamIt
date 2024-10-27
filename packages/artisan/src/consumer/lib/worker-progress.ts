import type { Job } from "bullmq";

export async function createProgressTracker<T extends Record<string, number>>(
  job: Job,
  obj: T,
) {
  await job.updateProgress(obj);

  let lastKey = Object.keys(obj)[0];
  let isUpdating = false;

  const persist = async () => {
    if (isUpdating) {
      return;
    }
    isUpdating = true;
    await job.updateProgress(obj);
    isUpdating = false;
  };

  return {
    update: (type: keyof T, value: number) => {
      if (value < 0) {
        value = 0;
      }

      if (lastKey !== type) {
        // @ts-expect-error keyof T
        obj[lastKey] = 100;
        lastKey = <string>type;
      }
      // @ts-expect-error keyof T
      obj[type] = value;
      persist();
    },
    finish: () => {
      Object.keys(obj).forEach((key) => {
        // @ts-expect-error keyof T
        obj[key] = 100;
      });
      persist();
    },
  };
}
