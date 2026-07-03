from dataclasses import dataclass

from app.domain.obligations import ObligationStatus
from app.domain.policies import ALLOWED_TRANSITIONS


@dataclass(frozen=True)
class TransitionView:
    available_transitions: list[str]
    submit_blocked_reason: str | None


def transition_view(
    *,
    status: ObligationStatus,
    requires_document: bool,
    has_document: bool,
) -> TransitionView:
    """Expose the transitions currently actionable by a client."""
    transitions = list(ALLOWED_TRANSITIONS[status])
    blocked_reason = None
    if ObligationStatus.SUBMITTED in transitions and requires_document and not has_document:
        transitions.remove(ObligationStatus.SUBMITTED)
        blocked_reason = "DOCUMENT_REQUIRED"
    return TransitionView(
        available_transitions=[transition.value for transition in transitions],
        submit_blocked_reason=blocked_reason,
    )
