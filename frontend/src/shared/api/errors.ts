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
    if (key === "errors" && Array.isArray(value)) {
      mapValidationErrors(value, fieldErrors);
      continue;
    }
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

function mapValidationErrors(
  errors: unknown[],
  fieldErrors: Record<string, string>,
) {
  for (const error of errors) {
    if (!isValidationError(error)) continue;
    const field = fieldFromLocation(error.loc);
    if (field && !fieldErrors[field]) fieldErrors[field] = error.msg;
  }
}

function isValidationError(
  value: unknown,
): value is { loc: unknown[]; msg: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "loc" in value &&
    "msg" in value &&
    Array.isArray(value.loc) &&
    typeof value.msg === "string"
  );
}

function fieldFromLocation(location: unknown[]) {
  const field = [...location]
    .reverse()
    .find((item): item is string => typeof item === "string" && item !== "body");
  return field ? toCamelCase(field) : null;
}

function toCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
