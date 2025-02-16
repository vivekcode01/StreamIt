import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  S3,
} from "@aws-sdk/client-s3";

declare module "bun" {
  interface Env {
    S3_ENDPOINT: string;
    S3_REGION: string;
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET: string;
  }
}

const client = new S3({
  endpoint: Bun.env.S3_ENDPOINT,
  region: Bun.env.S3_REGION,
  credentials: {
    accessKeyId: Bun.env.S3_ACCESS_KEY,
    secretAccessKey: Bun.env.S3_SECRET_KEY,
  },
});

async function clearFolder(prefix: string) {
  const response = await client.send(
    new ListObjectsCommand({
      Bucket: Bun.env.S3_BUCKET,
      Prefix: prefix,
    }),
  );
  await client.send(
    new DeleteObjectsCommand({
      Bucket: Bun.env.S3_BUCKET,
      Delete: {
        Objects:
          response.Contents?.map((item) => ({
            Key: item.Key,
          })) ?? [],
      },
    }),
  );
}

await clearFolder("transcode");
await clearFolder("package");
