export interface AppVariables {
  env: {
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    PUBLIC_S3_ENDPOINT: string;
    PUBLIC_STITCHER_ENDPOINT: string;
    PUBLIC_API_ENDPOINT?: string;
    SUPER_SECRET?: string;
  };
}
