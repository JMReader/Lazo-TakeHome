from app.domain.obligations import ObligationStatus
from app.domain.transition_view import transition_view


def test_transition_view_exposes_available_transitions():
    view = transition_view(
        status=ObligationStatus.IN_PROGRESS,
        requires_document=False,
        has_document=False,
    )

    assert view.available_transitions == ["submitted", "pending"]
    assert view.submit_blocked_reason is None


def test_transition_view_blocks_submit_when_document_is_missing():
    view = transition_view(
        status=ObligationStatus.IN_PROGRESS,
        requires_document=True,
        has_document=False,
    )

    assert view.available_transitions == ["pending"]
    assert view.submit_blocked_reason == "DOCUMENT_REQUIRED"
