import pytest

from app.domain.exceptions import DocumentRequiredForSubmission
from app.domain.obligations import ObligationStatus
from app.domain.policies import validate_document_gate


def test_submission_requires_document_when_obligation_requires_document():
    with pytest.raises(DocumentRequiredForSubmission):
        validate_document_gate(
            target_status=ObligationStatus.SUBMITTED,
            requires_document=True,
            has_document=False,
        )


def test_submission_is_allowed_when_required_document_exists():
    validate_document_gate(
        target_status=ObligationStatus.SUBMITTED,
        requires_document=True,
        has_document=True,
    )
