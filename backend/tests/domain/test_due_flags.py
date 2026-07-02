from datetime import date

from app.domain.date_rules import calculate_due_flags
from app.domain.obligations import ObligationStatus


def test_active_obligation_before_today_is_overdue_not_due_soon():
    flags = calculate_due_flags(
        due_date=date(2026, 7, 1),
        status=ObligationStatus.PENDING,
        business_today=date(2026, 7, 2),
        due_soon_window_days=30,
    )

    assert flags.is_overdue is True
    assert flags.is_due_soon is False


def test_active_obligation_inside_window_is_due_soon():
    flags = calculate_due_flags(
        due_date=date(2026, 7, 15),
        status=ObligationStatus.IN_PROGRESS,
        business_today=date(2026, 7, 2),
        due_soon_window_days=30,
    )

    assert flags.is_overdue is False
    assert flags.is_due_soon is True


def test_submitted_obligation_is_never_overdue_or_due_soon():
    flags = calculate_due_flags(
        due_date=date(2026, 7, 1),
        status=ObligationStatus.SUBMITTED,
        business_today=date(2026, 7, 2),
        due_soon_window_days=30,
    )

    assert flags.is_overdue is False
    assert flags.is_due_soon is False
