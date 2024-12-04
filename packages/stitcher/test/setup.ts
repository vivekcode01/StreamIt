import { mock, setSystemTime } from "bun:test";

mock.module("redis", () => ({
  createClient() {
    const items = new Map<string, string>();
    return {
      connect: () => Promise.resolve(),
      set: (key: string, value: string) => {
        items.set(key, value);
      },
      get: (key: string) => {
        return items.get(key) ?? null;
      },
    };
  },
}));

// The day my son was born!
setSystemTime(new Date(2021, 4, 2, 10, 12, 5, 250));

process.env = {
  TZ: "UTC",
  PUBLIC_S3_ENDPOINT: "s3-endpoint",
  PUBLIC_STITCHER_ENDPOINT: "stitcher-endpoint",
  SUPER_SECRET: "secret",
};
