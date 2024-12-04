import { setSystemTime } from "bun:test";

// The day my son was born!
setSystemTime(new Date(2021, 4, 2, 10, 12, 5, 250));

process.env = {
  TZ: "UTC",
  PUBLIC_S3_ENDPOINT: "s3-endpoint",
  PUBLIC_STITCHER_ENDPOINT: "stitcher-endpoint",
  PUBLIC_API_ENDPOINT: "api-endpoint",
  KV: "memory",
};
