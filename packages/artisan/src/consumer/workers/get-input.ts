import parseFilePath from "parse-filepath";
import { downloadFile } from "../s3";
import { TmpDir } from "../tmp-dir";
import type { Job } from "bullmq";
import type { Input } from "../../types";

export async function getInput(job: Job, tmpDir: TmpDir, input: Input) {
  const filePath = parseFilePath(input.path);

  // If the input is on S3, download the file locally.
  if (filePath.dir.startsWith("s3://")) {
    const inDir = await tmpDir.create();

    job.log(`Download "${filePath.path}" to "${inDir}"`);
    await downloadFile(inDir, filePath.path.replace("s3://", ""));

    return parseFilePath(`${inDir}/${filePath.basename}`);
  }

  if (
    filePath.dir.startsWith("http://") ||
    filePath.dir.startsWith("https://")
  ) {
    return filePath;
  }

  throw new Error("Failed to resolve input path");
}
