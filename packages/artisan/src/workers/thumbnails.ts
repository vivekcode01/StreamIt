import { ffmpeg } from "../lib/ffmpeg";
import { getMetaStruct } from "../lib/file-helpers";
import { getS3SignedUrl, syncToS3 } from "../lib/s3";
import type { MetaStruct } from "../lib/file-helpers";
import type { ThumbnailsData, ThumbnailsResult, WorkerCallback } from "bolt";

export const thumbnailsCallback: WorkerCallback<
  ThumbnailsData,
  ThumbnailsResult
> = async ({ job, dir, progressTracker }) => {
  const metaStruct = await getMetaStruct(job.data.assetId);
  const name = findStreamInputName(metaStruct);

  if (!name) {
    throw new Error("Failed to find suitable stream.");
  }

  const publicUrl = await getS3SignedUrl(
    `transcode/${job.data.assetId}/${name}`,
    60 * 30,
  );

  const outDir = await dir.createTempDir();

  const outputOptions = ["-ss 00:00:01.000", "-vframes 1"];

  await ffmpeg(
    publicUrl,
    `${outDir}/0.png`,
    outputOptions,
    (command) => {
      job.log(command);
    },
    (value) => {
      progressTracker.set("ffmpeg", value);
    },
  );

  const s3Dir = `thumbnails/${job.data.assetId}`;
  job.log(`Uploading to ${s3Dir}`);

  await syncToS3(outDir, s3Dir, {
    del: true,
    public: true,
  });

  return {
    assetId: job.data.assetId,
  };
};

function findStreamInputName(metaStruct: MetaStruct): string | null {
  let name: string | null = null;
  let lastHeight = 0;

  const entries = Object.entries(metaStruct.streams);
  for (const [key, value] of entries) {
    if (value.type === "video" && value.height > lastHeight) {
      name = key;
      lastHeight = value.height;
    }
  }

  return name;
}
