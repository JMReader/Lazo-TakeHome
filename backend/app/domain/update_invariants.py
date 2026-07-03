from app.domain.exceptions import InvalidObligationInvariant
from app.domain.obligations import ObligationStatus


def validate_requires_document_update(
    *,
    status: ObligationStatus,
    next_requires_document: bool,
    has_document: bool,
) -> None:
    """Preserve document invariants when requirements change after submission."""
    if status in {ObligationStatus.SUBMITTED, ObligationStatus.DONE}:
        if next_requires_document and not has_document:
            raise InvalidObligationInvariant(
                "Submitted or done obligations that require a document must have document metadata."
            )
