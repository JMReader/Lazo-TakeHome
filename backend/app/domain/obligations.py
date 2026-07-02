from enum import StrEnum


class ObligationType(StrEnum):
    ANNUAL_REPORT = "annual_report"
    FRANCHISE_TAX = "franchise_tax"
    BOI_REPORT = "boi_report"
    REGISTERED_AGENT_RENEWAL = "registered_agent_renewal"


class ObligationStatus(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    DONE = "done"


ACTIVE_STATUSES = {ObligationStatus.PENDING, ObligationStatus.IN_PROGRESS}
