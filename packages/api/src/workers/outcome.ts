import { addToQueue, packageQueue, DEFAULT_PACKAGE_NAME } from "bolt";
import { createAsset } from "../repositories/assets";
import { getOrCreateGroup } from "../repositories/groups";
import type { WorkerCallback, OutcomeData } from "bolt";

enum Step {
  Initial,
  Subsequent,
  Finish,
}

export const outcomeCallback: WorkerCallback<
  OutcomeData & { step?: Step }
> = async ({ job }) => {
  const { type, data } = job.data;

  let step = job.data.step ?? Step.Initial;
  while (step !== Step.Finish) {
    switch (step) {
      case Step.Initial: {
        if (type === "transcode") {
          let groupId: number | undefined;
          if (data.group) {
            const group = await getOrCreateGroup(data.group);
            groupId = group.id;
          }

          await createAsset({
            id: data.assetId,
            groupId,
          });
        }

        await job.updateData({
          ...job.data,
          step: Step.Subsequent,
        });
        step = Step.Subsequent;
        break;
      }

      case Step.Subsequent: {
        if (type === "transcode") {
          if (data.packageAfter) {
            await addToQueue(
              packageQueue,
              {
                assetId: data.assetId,
                name: DEFAULT_PACKAGE_NAME,
              },
              {
                id: [data.assetId, DEFAULT_PACKAGE_NAME],
              },
            );
          }
        }

        await job.updateData({
          ...job.data,
          step: Step.Finish,
        });
        step = Step.Finish;
        break;
      }
    }
  }
};
