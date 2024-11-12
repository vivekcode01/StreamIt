import {
  addToQueue,
  packageQueue,
  transcodeQueue,
  waitForChildren,
} from "bolt";
import type { PipelineData, PipelineResult, WorkerCallback } from "bolt";
import type { Job } from "bullmq";

enum Step {
  Initial,
  Continue,
  Wait,
  Finish,
}

export const pipelineCallback: WorkerCallback<
  PipelineData & { step?: Step },
  PipelineResult
> = async ({ job, token }) => {
  let step = job.data.step ?? Step.Initial;
  while (step !== Step.Finish) {
    switch (step) {
      case Step.Initial: {
        await handleStepInitial(job);
        await job.updateData({
          ...job.data,
          step: Step.Continue,
        });
        step = Step.Continue;
        break;
      }

      case Step.Continue: {
        await handleStepContinue(job, token);
        await job.updateData({
          ...job.data,
          step: Step.Wait,
        });
        step = Step.Wait;
        break;
      }

      case Step.Wait: {
        await waitForChildren(job, token);
        await job.updateData({
          ...job.data,
          step: Step.Finish,
        });
        step = Step.Finish;
        break;
      }
    }
  }

  return {
    assetId: job.data.assetId,
  };
};

async function handleStepInitial(job: Job<PipelineData>) {
  await addToQueue(
    transcodeQueue,
    {
      assetId: job.data.assetId,
      group: job.data.group,
      segmentSize: job.data.segmentSize,
      ...job.data.transcode,
    },
    {
      parent: job,
    },
  );
}

async function handleStepContinue(job: Job<PipelineData>, token?: string) {
  await waitForChildren(job, token);

  if (job.data.package) {
    await addToQueue(
      packageQueue,
      {
        assetId: job.data.assetId,
        ...job.data.package,
      },
      {
        parent: job,
      },
    );
  }
}
