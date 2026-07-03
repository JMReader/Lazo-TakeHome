import "server-only";
import type {
  DeleteObligationResponse,
  ObligationCreateRequest,
  ObligationDetailResponse,
  ObligationDocumentRequest,
  ObligationListResponse,
  ObligationUpdateRequest,
  StatusChangeRequest,
} from "@/entities/obligation/types";
import { ApiError, type ApiErrorPayload } from "@/shared/api/errors";

const defaultApiBaseUrl = "http://127.0.0.1:8001";

function apiBaseUrl() {
  return process.env.BACKEND_API_BASE_URL ?? defaultApiBaseUrl;
}

function url(path: string) {
  return `${apiBaseUrl()}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseErrorPayload(value: unknown): ApiErrorPayload {
  if (!isRecord(value)) {
    return {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected API error.",
      details: {},
    };
  }
  return {
    code: typeof value.code === "string" ? value.code : "INTERNAL_SERVER_ERROR",
    message: typeof value.message === "string" ? value.message : "Unexpected API error.",
    details: isRecord(value.details) ? value.details : {},
  };
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(url(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const hasBody = response.status !== 204;
  const payload: unknown = hasBody ? await response.json() : {};

  if (!response.ok) {
    throw new ApiError(parseErrorPayload(payload), response.status);
  }

  return payload as TResponse;
}

export function listObligations() {
  return request<ObligationListResponse>("/api/obligations");
}

export function getObligation(obligationId: string) {
  return request<ObligationDetailResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}`,
  );
}

export function createObligation(payload: ObligationCreateRequest) {
  return request<ObligationDetailResponse>("/api/obligations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateObligation(
  obligationId: string,
  payload: ObligationUpdateRequest,
) {
  return request<ObligationDetailResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function changeObligationStatus(
  obligationId: string,
  payload: StatusChangeRequest,
) {
  return request<ObligationDetailResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function attachObligationDocument(
  obligationId: string,
  payload: ObligationDocumentRequest,
) {
  return request<ObligationDetailResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}/document`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteObligationDocument(
  obligationId: string,
  expectedVersion: number,
) {
  return request<ObligationDetailResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}/document?expectedVersion=${expectedVersion}`,
    {
      method: "DELETE",
    },
  );
}

export function deleteObligation(obligationId: string) {
  return request<DeleteObligationResponse>(
    `/api/obligations/${encodeURIComponent(obligationId)}`,
    {
      method: "DELETE",
    },
  );
}
