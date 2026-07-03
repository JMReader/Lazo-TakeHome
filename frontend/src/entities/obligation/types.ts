export const obligationStatuses = [
  "pending",
  "in_progress",
  "submitted",
  "done",
] as const;

export type ObligationStatus = (typeof obligationStatuses)[number];

export const obligationTypes = [
  "annual_report",
  "franchise_tax",
  "boi_report",
  "registered_agent_renewal",
] as const;

export type ObligationType = (typeof obligationTypes)[number];

export type ObligationListItem = {
  id: string;
  type: ObligationType;
  title: string;
  description: string;
  status: ObligationStatus;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  hasDocument: boolean;
  companyTaxIdMasked: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  availableTransitions: ObligationStatus[];
  submitBlockedReason: string | null;
  version: number;
};

export type DocumentMetadata = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type AuditEvent = {
  id: string;
  fromStatus: ObligationStatus | null;
  toStatus: ObligationStatus;
  changedAt: string;
  changedBy: string;
  obligationVersion: number;
  reason: string | null;
};

export type ObligationDetail = ObligationListItem & {
  document: DocumentMetadata | null;
  auditHistory: AuditEvent[];
};

export type ObligationListResponse = {
  obligations: ObligationListItem[];
};

export type ObligationDetailResponse = {
  obligation: ObligationDetail;
};

export type ObligationCreateRequest = {
  type: ObligationType;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  companyTaxId: string;
};

export type ObligationUpdateRequest = {
  expectedVersion: number;
  type?: ObligationType;
  title?: string;
  description?: string;
  dueDate?: string;
  owner?: string;
  requiresDocument?: boolean;
  companyTaxId?: string;
};

export type StatusChangeRequest = {
  targetStatus: ObligationStatus;
  expectedVersion: number;
  reason?: string;
};

export type ObligationDocumentRequest = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey?: string;
  expectedVersion: number;
};

export type DeleteObligationResponse = {
  deleted: boolean;
};
