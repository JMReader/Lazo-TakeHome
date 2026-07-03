from datetime import date

from app.api.schemas import (
    AuditEventResponse,
    DocumentResponse,
    ObligationDetailItemResponse,
    ObligationListItemResponse,
)
from app.domain.date_rules import calculate_due_flags
from app.domain.obligations import ObligationStatus, ObligationType
from app.domain.transition_view import transition_view
from app.infrastructure.db.models import ObligationModel, ObligationStatusAuditModel


def present_obligation_list_item(
    model: ObligationModel,
    *,
    business_today: date,
    due_soon_window_days: int,
) -> ObligationListItemResponse:
    return ObligationListItemResponse.model_validate(
        _obligation_summary_payload(
            model,
            business_today=business_today,
            due_soon_window_days=due_soon_window_days,
        )
    )


def present_obligation_detail(
    model: ObligationModel,
    *,
    business_today: date,
    due_soon_window_days: int,
) -> ObligationDetailItemResponse:
    payload = _obligation_summary_payload(
        model,
        business_today=business_today,
        due_soon_window_days=due_soon_window_days,
    )
    payload["document"] = _document_payload(model)
    payload["audit_history"] = [_audit_event_payload(event) for event in model.audit_events]
    return ObligationDetailItemResponse.model_validate(payload)


def _obligation_summary_payload(
    model: ObligationModel,
    *,
    business_today: date,
    due_soon_window_days: int,
) -> dict:
    status = ObligationStatus(model.status)
    flags = calculate_due_flags(
        due_date=model.due_date,
        status=status,
        business_today=business_today,
        due_soon_window_days=due_soon_window_days,
    )
    transitions = transition_view(
        status=status,
        requires_document=model.requires_document,
        has_document=model.document is not None,
    )
    return {
        "id": model.id,
        "type": ObligationType(model.type),
        "title": model.title,
        "description": model.description,
        "status": status,
        "due_date": model.due_date,
        "owner": model.owner,
        "requires_document": model.requires_document,
        "has_document": model.document is not None,
        "company_tax_id_masked": f"****{model.company_tax_id_last4}",
        "is_overdue": flags.is_overdue,
        "is_due_soon": flags.is_due_soon,
        "available_transitions": transitions.available_transitions,
        "submit_blocked_reason": transitions.submit_blocked_reason,
        "version": model.version,
    }


def _document_payload(model: ObligationModel) -> DocumentResponse | None:
    if model.document is None:
        return None
    return DocumentResponse.model_validate(
        {
            "id": model.document.id,
            "file_name": model.document.file_name,
            "content_type": model.document.content_type,
            "size_bytes": model.document.size_bytes,
            "storage_key": model.document.storage_key,
            "uploaded_at": model.document.uploaded_at,
            "uploaded_by": model.document.uploaded_by,
        }
    )


def _audit_event_payload(event: ObligationStatusAuditModel) -> AuditEventResponse:
    return AuditEventResponse.model_validate(
        {
            "id": event.id,
            "from_status": ObligationStatus(event.from_status),
            "to_status": ObligationStatus(event.to_status),
            "changed_at": event.changed_at,
            "changed_by": event.changed_by,
            "obligation_version": event.obligation_version,
            "reason": event.reason,
        }
    )
