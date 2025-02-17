import type { ContentfulStatusCode } from "hono/utils/http-status";

type ApiErrorCode = never;

export function apiError(code: ApiErrorCode) {
  const status: ContentfulStatusCode = 500;

  throw new ApiError(code, status);
}

/**
 * Represents a known API error, will be mapped to a response.
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: ContentfulStatusCode,
  ) {
    super();
  }
}
