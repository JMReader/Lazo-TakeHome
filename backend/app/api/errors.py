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
    return {"code": code, "message": message, "details": details or {}}


async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
    status_code = STATUS_BY_ERROR.get(type(exc), 422)
    return JSONResponse(
        status_code=status_code,
        content=error_payload(exc.code, str(exc)),
    )


async def validation_error_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_payload(
            "VALIDATION_ERROR", "Request validation failed.", {"errors": exc.errors()}
        ),
    )


def install_error_handlers(app) -> None:
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
