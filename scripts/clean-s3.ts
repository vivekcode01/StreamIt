import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  S3,
} from "@aws-sdk/client-s3";
import { env } from "../packages/api/src/env";

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

for (const prefix of ["transcode", "package"]) {
  const response = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Prefix: prefix,
    }),
  );
  await client.send(
    new DeleteObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delete: {
        Objects:
          response.Contents?.map((item) => ({
            Key: item.Key,
          })) ?? [],
      },
    }),
  );
}
