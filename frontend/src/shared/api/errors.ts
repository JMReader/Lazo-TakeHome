export const knownApiErrorCodes = [
  "VALIDATION_ERROR",
  "OBLIGATION_NOT_FOUND",
  "INVALID_STATUS_TRANSITION",
  "DOCUMENT_REQUIRED_FOR_SUBMISSION",
  "OBLIGATION_VERSION_CONFLICT",
  "INTERNAL_SERVER_ERROR",
] as const;

export type KnownApiErrorCode = (typeof knownApiErrorCodes)[number];

export type ApiErrorPayload = {
  code: KnownApiErrorCode | string;
  message: string;
  details: Record<string, unknown>;
};

export class ApiError extends Error {
  code: KnownApiErrorCode | string;
  details: Record<string, unknown>;
  status: number;

  constructor(payload: ApiErrorPayload, status: number) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.details = payload.details;
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function fieldErrorsFromDetails(details: Record<string, unknown>) {
  const fieldErrors: Record<string, string> = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string") {
      fieldErrors[key] = value;
    }
    if (Array.isArray(value)) {
      const first = value.find((item): item is string => typeof item === "string");
      if (first) fieldErrors[key] = first;
    }
  }
  return fieldErrors;
}
