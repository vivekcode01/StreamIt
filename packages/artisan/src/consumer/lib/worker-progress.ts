import type { Job } from "bullmq";

export async function createProgressTracker<T extends [string, number][]>(
  job: Job,
  tuples: T,
) {
  await job.updateProgress(tuples);

  let lastKey = tuples[0]?.[0];

  let updating = false;
  const persist = async () => {
    if (updating) {
      return;
    }
    updating = true;
    await job.updateProgress(tuples);
    updating = false;
  };

  const updateTuple = (key: string, value: number) => {
    if (value < 0) {
      value = 0;
    }
    const index = tuples.findIndex((tuple) => tuple[0] === key);
    if (tuples[index]) {
      tuples[index][1] = value;
    }
  };

  return {
    update: (key: string, value: number) => {
      if (lastKey !== key) {
        if (lastKey) {
          updateTuple(lastKey, 100);
        }
        lastKey = key;
      }
      updateTuple(key, value);
      persist();
    },
    finish: () => {
      tuples.forEach((tuple) => {
        tuple[1] = 100;
      });
      persist();
    },
  };
}
