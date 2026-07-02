from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.obligations import ObligationStatus, ObligationType


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
        use_enum_values=False,
    )


class ObligationCreateRequest(CamelModel):
    type: ObligationType
    title: str = Field(min_length=1)
    description: str = ""
    due_date: date
    owner: str = Field(min_length=1)
    requires_document: bool
    company_tax_id: str = Field(min_length=1)


class ObligationUpdateRequest(CamelModel):
    expected_version: int = Field(ge=1)
    type: ObligationType | None = None
    title: str | None = Field(default=None, min_length=1)
    description: str | None = None
    due_date: date | None = None
    owner: str | None = Field(default=None, min_length=1)
    requires_document: bool | None = None
    company_tax_id: str | None = Field(default=None, min_length=1)


class StatusChangeRequest(CamelModel):
    target_status: ObligationStatus
    expected_version: int = Field(ge=1)
    reason: str | None = None


class ObligationDocumentRequest(CamelModel):
    file_name: str = Field(min_length=1)
    content_type: str = Field(min_length=1)
    size_bytes: int = Field(gt=0)
    storage_key: str | None = None
    expected_version: int = Field(ge=1)


class AuditEventResponse(CamelModel):
    id: str
    from_status: ObligationStatus
    to_status: ObligationStatus
    changed_at: datetime
    changed_by: str
    obligation_version: int
    reason: str | None = None


class DocumentResponse(CamelModel):
    id: str
    file_name: str
    content_type: str
    size_bytes: int
    storage_key: str
    uploaded_at: datetime
    uploaded_by: str


class ObligationResponse(CamelModel):
    id: str
    type: ObligationType
    title: str
    description: str
    status: ObligationStatus
    due_date: date
    owner: str
    requires_document: bool
    has_document: bool
    company_tax_id_masked: str
    is_overdue: bool
    is_due_soon: bool
    available_transitions: list[str]
    submit_blocked_reason: str | None
    version: int
    document: DocumentResponse | None = None
    audit_history: list[AuditEventResponse] = Field(default_factory=list)


class ObligationDetailResponse(CamelModel):
    obligation: ObligationResponse


class ObligationListResponse(CamelModel):
    obligations: list[ObligationResponse]


class ErrorResponse(CamelModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
