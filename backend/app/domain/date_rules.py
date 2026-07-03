from dataclasses import dataclass
from datetime import date, timedelta

from app.domain.obligations import ObligationStatus


@dataclass(frozen=True)
class DueFlags:
    is_overdue: bool
    is_due_soon: bool


def calculate_due_flags(
    *,
    due_date: date,
    status: ObligationStatus,
    business_today: date,
    due_soon_window_days: int,
) -> DueFlags:
    """Derive backend-owned due state for an obligation."""
    is_terminal = status in {ObligationStatus.SUBMITTED, ObligationStatus.DONE}
    is_overdue = due_date < business_today and not is_terminal
    due_soon_limit = business_today + timedelta(days=due_soon_window_days)
    is_due_soon = business_today <= due_date <= due_soon_limit and not is_terminal
    return DueFlags(is_overdue=is_overdue, is_due_soon=is_due_soon)
