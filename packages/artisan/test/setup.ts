import { mock } from "bun:test";

// We're going to mock bolt entirely as we do not want job runners
// to actually do work during tests.
mock.module("bolt", () => ({
  getChildren: () => [],
  waitForChildren: () => Promise.resolve(),
  outcomeQueue: undefined,
  ffmpegQueue: undefined,
  ffprobeQueue: undefined,
  addToQueue: undefined,
}));

process.env = {
  NODE_ENV: "test",
  TZ: "UTC",
  S3_ENDPOINT: "s3-endpoint",
  S3_REGION: "s3-region",
  S3_ACCESS_KEY: "s3-access-key",
  S3_SECRET_KEY: "s3-secret-key",
  S3_BUCKET: "s3-bucket",
};
