import Elysia, { ValidationError } from "elysia";

type ApiErrorCode = {
  ERR_VALIDATION: {
    test: number;
  };
  ERR_UNAUTHORIZED: never;
  ERR_USER_INVALID_CREDENTIALS: never;
};

const statusMap: Record<keyof ApiErrorCode, number> = {
  ERR_VALIDATION: 403,
  ERR_UNAUTHORIZED: 401,
  ERR_USER_INVALID_CREDENTIALS: 401,
};

export type ApiError<T extends keyof ApiErrorCode = keyof ApiErrorCode> = {
  type: T;
} & ApiErrorCode[T];

export class DeliberateError<C extends keyof ApiErrorCode> extends Error {
  constructor(
    private params_: ApiErrorCode[C] extends never
      ? { type: C }
      : { type: C; data: ApiErrorCode[C] },
  ) {
    super("");
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
        const data = mapValidationError(error);
        return {
          type: "ERR_VALIDATION",
          data,
        };
      }

      set.status = 500;
      return {
        type: "ERR_UNKNOWN",
      };
    });

function mapValidationError(error: ValidationError) {
  const first = error.validator.Errors(error.value).First();
  return `${first.path} - ${first.message}`;
}
