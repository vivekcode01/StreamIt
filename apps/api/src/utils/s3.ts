import { GetObjectCommand, ListObjectsCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

export type StorageFolderItem =
  | {
      type: "file";
      path: string;
      size: number;
    }
  | {
      type: "folder";
      path: string;
    };

export interface StorageFolder {
  cursor?: string;
  items: StorageFolderItem[];
}

const client = new S3({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function getStorageFolder(
  path: string,
  take: number,
  cursor?: string,
): Promise<StorageFolder> {
  path = path.substring(1);

  const response = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delimiter: "/",
      Prefix: path,
      MaxKeys: take,
      Marker: cursor,
    }),
  );

  const items: StorageFolderItem[] = [];

  response.CommonPrefixes?.forEach((prefix) => {
    if (!prefix.Prefix) {
      return;
    }
    items.push({
      type: "folder",
      path: `/${prefix.Prefix}`,
    });
  });

  response.Contents?.forEach((content) => {
    if (!content.Key || content.Key === path) {
      return;
    }

    items.push({
      type: "file",
      path: `/${content.Key}`,
      size: content.Size ?? 0,
    });
  });

  return {
    cursor: response.IsTruncated ? response.NextMarker : undefined,
    items,
  };
}

export async function getStorageFileUrl(path: string) {
  path = path.substring(1);
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: path,
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore https://github.com/aws/aws-sdk-js-v3/issues/4451
  const url = await getSignedUrl(client, command, {
    expiresIn: 60 * 15,
  });
  return url;
}

export async function getStorageFilePayload(path: string) {
  path = path.substring(1);
  const command = await client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: path,
    }),
  );
  return await command.Body!.transformToString("utf-8");
}
