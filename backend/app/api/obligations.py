from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.schemas import (
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


async def get_session(request: Request):
    session_factory: async_sessionmaker[AsyncSession] = request.app.state.session_factory
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def get_service(request: Request, session: Annotated[AsyncSession, Depends(get_session)]):
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
    return await service.list()


@router.post("", response_model=ObligationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_obligation(
    request: ObligationCreateRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.create(request)


@router.get("/{obligation_id}", response_model=ObligationDetailResponse)
async def get_obligation(
    obligation_id: str,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.get(obligation_id)


@router.patch("/{obligation_id}", response_model=ObligationDetailResponse)
async def update_obligation(
    obligation_id: str,
    request: ObligationUpdateRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.update(obligation_id, request)


@router.delete("/{obligation_id}")
async def delete_obligation(
    obligation_id: str,
    service: Annotated[ObligationService, Depends(get_service)],
) -> dict[str, bool]:
    return await service.delete(obligation_id)


@router.patch("/{obligation_id}/status", response_model=ObligationDetailResponse)
async def change_status(
    obligation_id: str,
    request: StatusChangeRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.change_status(obligation_id, request)


@router.put("/{obligation_id}/document", response_model=ObligationDetailResponse)
async def attach_document(
    obligation_id: str,
    request: ObligationDocumentRequest,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.attach_document(obligation_id, request)


@router.delete("/{obligation_id}/document", response_model=ObligationDetailResponse)
async def delete_document(
    obligation_id: str,
    expectedVersion: int,
    service: Annotated[ObligationService, Depends(get_service)],
) -> ObligationDetailResponse:
    return await service.delete_document(obligation_id, expectedVersion)


def today_provider(fixed_today: date | None):
    if fixed_today is not None:
        return lambda: fixed_today
    return lambda: datetime.now(UTC).date()
