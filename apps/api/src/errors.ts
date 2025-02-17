import type { ContentfulStatusCode } from "hono/utils/http-status";

type ApiErrorCode =
  | "ERR_AUTH_INVALID_CREDENTIALS"
  | "ERR_AUTH_INVALID_ROLE"
  | "ERR_STORAGE_NO_FILE_PREVIEW"
  | "ERR_JOB_NOT_FOUND";

export function apiError(code: ApiErrorCode) {
  let status: ContentfulStatusCode = 500;
  switch (code) {
    case "ERR_AUTH_INVALID_CREDENTIALS":
    case "ERR_AUTH_INVALID_ROLE":
      status = 401;
      break;
    case "ERR_STORAGE_NO_FILE_PREVIEW":
    case "ERR_JOB_NOT_FOUND":
      status = 404;
      break;
  }

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
