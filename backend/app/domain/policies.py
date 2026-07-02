from app.domain.exceptions import DocumentRequiredForSubmission, InvalidStatusTransition
from app.domain.obligations import ObligationStatus

ALLOWED_TRANSITIONS: dict[ObligationStatus, list[ObligationStatus]] = {
    ObligationStatus.PENDING: [ObligationStatus.IN_PROGRESS],
    ObligationStatus.IN_PROGRESS: [ObligationStatus.SUBMITTED, ObligationStatus.PENDING],
    ObligationStatus.SUBMITTED: [ObligationStatus.DONE, ObligationStatus.IN_PROGRESS],
    ObligationStatus.DONE: [ObligationStatus.IN_PROGRESS],
}


def validate_transition(current_status: ObligationStatus, target_status: ObligationStatus) -> None:
    if target_status not in ALLOWED_TRANSITIONS[current_status]:
        raise InvalidStatusTransition(
            f"Cannot transition obligation from {current_status} to {target_status}."
        )


def validate_document_gate(
    *,
    target_status: ObligationStatus,
    requires_document: bool,
    has_document: bool,
) -> None:
    if target_status == ObligationStatus.SUBMITTED and requires_document and not has_document:
        raise DocumentRequiredForSubmission("Document metadata is required before submission.")
