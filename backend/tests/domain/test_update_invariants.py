import pytest

from app.domain.exceptions import InvalidObligationInvariant
from app.domain.obligations import ObligationStatus
from app.domain.update_invariants import validate_requires_document_update


def test_submitted_obligation_cannot_require_missing_document():
    with pytest.raises(InvalidObligationInvariant):
        validate_requires_document_update(
            status=ObligationStatus.SUBMITTED,
            next_requires_document=True,
            has_document=False,
        )


def test_submitted_obligation_can_require_existing_document():
    validate_requires_document_update(
        status=ObligationStatus.SUBMITTED,
        next_requires_document=True,
        has_document=True,
    )
