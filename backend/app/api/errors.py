from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    DocumentRequiredForSubmission,
    DomainError,
    InvalidObligationInvariant,
    InvalidStatusTransition,
    ObligationNotFound,
    ObligationVersionConflict,
)

STATUS_BY_ERROR = {
    ObligationNotFound: 404,
    InvalidStatusTransition: 422,
    DocumentRequiredForSubmission: 422,
    InvalidObligationInvariant: 422,
    ObligationVersionConflict: 409,
}


def error_payload(code: str, message: str, details: dict | None = None) -> dict:
    """Build the normalized API error payload."""
    return {"code": code, "message": message, "details": details or {}}


async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
    """Map domain exceptions to stable HTTP error responses."""
    status_code = STATUS_BY_ERROR.get(type(exc), 422)
    return JSONResponse(
        status_code=status_code,
        content=error_payload(exc.code, str(exc)),
    )


async def validation_error_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Map FastAPI validation failures to the normalized error contract."""
    return JSONResponse(
        status_code=422,
        content=error_payload(
            "VALIDATION_ERROR", "Request validation failed.", {"errors": exc.errors()}
        ),
    )


def install_error_handlers(app) -> None:
    """Register API exception handlers on a FastAPI app."""
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
