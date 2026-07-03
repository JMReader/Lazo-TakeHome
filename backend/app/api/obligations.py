from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.schemas import (
    ErrorResponse,
    ObligationCreateRequest,
    ObligationDetailResponse,
    ObligationDocumentRequest,
    ObligationListResponse,
    ObligationUpdateRequest,
    StatusChangeRequest,
)
from app.application.use_cases import ObligationService
from app.infrastructure.security.tax_id import TaxIdProtector

router = APIRouter(prefix="/api/obligations", tags=["obligations"])

VALIDATION_ERROR_RESPONSE = {
    "model": ErrorResponse,
    "description": "Validation or domain rule error.",
}
NOT_FOUND_RESPONSE = {
    "model": ErrorResponse,
    "description": "Obligation not found.",
}
CONFLICT_RESPONSE = {
    "model": ErrorResponse,
    "description": "Optimistic locking version conflict.",
}


async def get_session(request: Request):
    """Provide a transactional database session for each API request."""
    session_factory: async_sessionmaker[AsyncSession] = request.app.state.session_factory
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def get_service(request: Request, session: Annotated[AsyncSession, Depends(get_session)]):
    """Build the obligation service with request-scoped infrastructure."""
    return ObligationService(
        session,
        tax_id_protector=TaxIdProtector(request.app.state.pii_encryption_key),
        business_today=request.app.state.business_today(),
        due_soon_window_days=request.app.state.due_soon_window_days,
    )


@router.get("", response_model=ObligationListResponse)
async def list_obligations(
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationListResponse:
    """Return compact obligation records for dashboard-style views."""
    return await service.list()


@router.post(
    "",
    response_model=ObligationDetailResponse,
    status_code=status.HTTP_201_CREATED,
    responses={422: VALIDATION_ERROR_RESPONSE},
)
async def create_obligation(
    request: ObligationCreateRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Create a pending obligation and return its full detail."""
    return await service.create(request)


@router.get(
    "/{obligation_id}",
    response_model=ObligationDetailResponse,
    responses={404: NOT_FOUND_RESPONSE},
)
async def get_obligation(
    obligation_id: str,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Return the full detail for a single obligation."""
    return await service.get(obligation_id)


@router.patch(
    "/{obligation_id}",
    response_model=ObligationDetailResponse,
    responses={
        404: NOT_FOUND_RESPONSE,
        409: CONFLICT_RESPONSE,
        422: VALIDATION_ERROR_RESPONSE,
    },
)
async def update_obligation(
    obligation_id: str,
    request: ObligationUpdateRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Apply non-status obligation changes with optimistic locking."""
    return await service.update(obligation_id, request)


@router.delete(
    "/{obligation_id}",
    responses={404: NOT_FOUND_RESPONSE},
)
async def delete_obligation(
    obligation_id: str,
    service: Annotated[ObligationService, Depends(get_service)],
) -> dict[str, bool]:
    """Delete an obligation and its owned metadata."""
    return await service.delete(obligation_id)


@router.patch(
    "/{obligation_id}/status",
    response_model=ObligationDetailResponse,
    responses={
        404: NOT_FOUND_RESPONSE,
        409: CONFLICT_RESPONSE,
        422: VALIDATION_ERROR_RESPONSE,
    },
)
async def change_status(
    obligation_id: str,
    request: StatusChangeRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Move an obligation through the workflow and audit the change."""
    return await service.change_status(obligation_id, request)


@router.put(
    "/{obligation_id}/document",
    response_model=ObligationDetailResponse,
    responses={
        404: NOT_FOUND_RESPONSE,
        409: CONFLICT_RESPONSE,
        422: VALIDATION_ERROR_RESPONSE,
    },
)
async def attach_document(
    obligation_id: str,
    request: ObligationDocumentRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Attach or replace document metadata for an obligation."""
    return await service.attach_document(obligation_id, request)


@router.delete(
    "/{obligation_id}/document",
    response_model=ObligationDetailResponse,
    responses={
        404: NOT_FOUND_RESPONSE,
        409: CONFLICT_RESPONSE,
        422: VALIDATION_ERROR_RESPONSE,
    },
)
async def delete_document(
    obligation_id: str,
    expectedVersion: Annotated[int, Query(ge=1)],
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    """Remove document metadata while preserving obligation history."""
    return await service.delete_document(obligation_id, expectedVersion)


def today_provider(fixed_today: date | None):
    """Return a business-date provider for production or deterministic tests."""
    if fixed_today is not None:
        return lambda: fixed_today
    return lambda: datetime.now(UTC).date()
