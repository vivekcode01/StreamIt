import { addToQueue, DEFAULT_PACKAGE_NAME, packageQueue } from "bolt";
import { createAsset } from "../repositories/assets";
import { getOrCreateGroup } from "../repositories/groups";
import { createPlayable } from "../repositories/playables";
import type { OutcomeData, WorkerCallback } from "bolt";

export const outcomeCallback: WorkerCallback<OutcomeData> = async ({ job }) => {
  switch (job.data.type) {
    case "transcode": {
      const { data } = job.data;
      let groupId: number | undefined;
      if (data.group) {
        const group = await getOrCreateGroup(data.group);
        groupId = group.id;
      }

      await createAsset({
        id: data.assetId,
        groupId,
      });

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
      break;
    }
    case "package": {
      const { data } = job.data;
      await createPlayable({
        assetId: data.assetId,
        name: data.name,
      });
      break;
    }
  }
};
