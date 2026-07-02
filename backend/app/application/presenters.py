from datetime import date

from app.api.schemas import (
    AuditEventResponse,
    DocumentResponse,
    ObligationResponse,
)
from app.domain.date_rules import calculate_due_flags
from app.domain.obligations import ObligationStatus, ObligationType
from app.domain.transition_view import transition_view
from app.infrastructure.db.models import ObligationModel


def present_obligation(
    model: ObligationModel,
    *,
    business_today: date,
    due_soon_window_days: int,
) -> ObligationResponse:
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
    document = None
    if model.document is not None:
        document = DocumentResponse.model_validate(
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
    return ObligationResponse.model_validate(
        {
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
            "document": document,
            "audit_history": [
                AuditEventResponse.model_validate(
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
                for event in model.audit_events
            ],
        }
    )
