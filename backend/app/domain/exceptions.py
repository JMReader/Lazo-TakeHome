class DomainError(Exception):
    code = "DOMAIN_ERROR"


class InvalidStatusTransition(DomainError):
    code = "INVALID_STATUS_TRANSITION"


class DocumentRequiredForSubmission(DomainError):
    code = "DOCUMENT_REQUIRED_FOR_SUBMISSION"


class ObligationVersionConflict(DomainError):
    code = "OBLIGATION_VERSION_CONFLICT"


class ObligationNotFound(DomainError):
    code = "OBLIGATION_NOT_FOUND"


class InvalidObligationInvariant(DomainError):
    code = "INVALID_OBLIGATION_INVARIANT"
