import { addToQueue } from "bolt";
import { packageQueue, transcodeQueue, waitForChildren } from "bolt";
import { getChildren } from "bolt";
import type {
  PackageResult,
  PipelineData,
  PipelineResult,
  TranscodeResult,
  WorkerCallback,
} from "bolt";

export const pipelineCallback: WorkerCallback<
  PipelineData,
  PipelineResult
> = async ({ job, token }) => {
  const { package: packageData, ...transcodeData } = job.data;

  const [transcodeResult] = await getChildren<TranscodeResult>(
    job,
    "transcode",
  );

  if (!transcodeResult) {
    await addToQueue(transcodeQueue, transcodeData, {
      parent: job,
      options: {
        failParentOnFailure: true,
      },
    });
    await waitForChildren(job, token);
  }

  if (packageData) {
    const [packageResult] = await getChildren<PackageResult>(job, "package");
    if (!packageResult) {
      await addToQueue(packageQueue, packageData, {
        parent: job,
        options: {
          failParentOnFailure: true,
        },
      });
      await waitForChildren(job, token);
    }
  }

  return {
    assetId: job.data.assetId,
  };
};
