import Elysia, { ValidationError } from "elysia";

type ApiErrorCode = {
  ERR_UNKNOWN: never;
  ERR_VALIDATION: {
    path: string;
    fail: string;
  };
  ERR_UNAUTHORIZED: never;
  ERR_NOT_FOUND: never;
  ERR_USER_INVALID_CREDENTIALS: never;
  ERR_USER_INVALID_TOKEN_TYPE: {
    only: "service" | "user";
  };
};

const statusMap: Record<keyof ApiErrorCode, number> = {
  ERR_UNKNOWN: 500,
  ERR_VALIDATION: 403,
  ERR_NOT_FOUND: 404,
  ERR_UNAUTHORIZED: 401,
  ERR_USER_INVALID_CREDENTIALS: 401,
  ERR_USER_INVALID_TOKEN_TYPE: 401,
};

export type ApiError<T extends keyof ApiErrorCode = keyof ApiErrorCode> = {
  type: T;
  message?: string;
} & ApiErrorCode[T];

export class DeliberateError<C extends keyof ApiErrorCode> extends Error {
  constructor(
    private params_: ApiErrorCode[C] extends never
      ? { type: C; message?: string }
      : { type: C; message?: string; data: ApiErrorCode[C] },
  ) {
    super(params_.message ?? "");
  }

  get type(): keyof ApiErrorCode {
    return this.params_.type;
  }

  get data() {
    return typeof this.params_ === "object" && "data" in this.params_
      ? this.params_.data
      : undefined;
  }
}

export const errors = () =>
  new Elysia()
    .error({
      DELIBERATE_ERROR: DeliberateError,
    })
    .onError({ as: "global" }, ({ code, error, set }) => {
      if (code === "DELIBERATE_ERROR") {
        set.status = statusMap[error.type];
        return {
          type: error.type,
          ...error.data,
        } satisfies ApiError;
      }

      if (code === "VALIDATION") {
        return mapValidationError(error);
      }

      set.status = 500;
      return {
        type: "ERR_UNKNOWN",
      };
    });

function mapValidationError(
  error: ValidationError,
): ApiError<"ERR_VALIDATION"> {
  const first = error.validator.Errors(error.value).First();
  return {
    type: "ERR_VALIDATION",
    path: first.path,
    fail: first.message,
  };
}
