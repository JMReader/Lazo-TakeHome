import pytest

from app.domain.exceptions import InvalidStatusTransition
from app.domain.obligations import ObligationStatus
from app.domain.policies import validate_transition


@pytest.mark.parametrize(
    ("current", "target"),
    [
        (ObligationStatus.PENDING, ObligationStatus.IN_PROGRESS),
        (ObligationStatus.IN_PROGRESS, ObligationStatus.SUBMITTED),
        (ObligationStatus.IN_PROGRESS, ObligationStatus.PENDING),
        (ObligationStatus.SUBMITTED, ObligationStatus.DONE),
        (ObligationStatus.SUBMITTED, ObligationStatus.IN_PROGRESS),
        (ObligationStatus.DONE, ObligationStatus.IN_PROGRESS),
    ],
)
def test_valid_status_transitions_are_accepted(current, target):
    validate_transition(current, target)


def test_invalid_status_transition_is_rejected():
    with pytest.raises(InvalidStatusTransition):
        validate_transition(ObligationStatus.PENDING, ObligationStatus.DONE)
