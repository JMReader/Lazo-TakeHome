from datetime import date
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    ObligationCreateRequest,
    ObligationDetailResponse,
    ObligationDocumentRequest,
    ObligationListResponse,
    ObligationUpdateRequest,
    StatusChangeRequest,
)
from app.application.presenters import present_obligation_detail, present_obligation_list_item
from app.domain.obligations import ObligationStatus
from app.domain.policies import validate_document_gate, validate_transition
from app.domain.update_invariants import validate_requires_document_update
from app.infrastructure.db.repositories import ObligationRepository
from app.infrastructure.security.tax_id import TaxIdProtector


class ObligationService:
    def __init__(
        self,
        session: AsyncSession,
        *,
        tax_id_protector: TaxIdProtector,
        business_today: date,
        due_soon_window_days: int,
    ) -> None:
        """Coordinate obligation use cases with persistence and policy services."""
        self._repo = ObligationRepository(session)
        self._tax_id_protector = tax_id_protector
        self._business_today = business_today
        self._due_soon_window_days = due_soon_window_days

    async def create(self, request: ObligationCreateRequest) -> ObligationDetailResponse:
        """Create an obligation with protected tax ID storage."""
        protected_tax_id = self._tax_id_protector.protect(request.company_tax_id)
        model = await self._repo.create(
            {
                "type": request.type.value,
                "title": request.title,
                "description": request.description,
                "due_date": request.due_date,
                "owner": request.owner,
                "requires_document": request.requires_document,
                "company_tax_id_encrypted": protected_tax_id.encrypted,
                "company_tax_id_last4": protected_tax_id.last4,
            }
        )
        return self._detail(model)

    async def list(self) -> ObligationListResponse:
        """Return obligations using the compact list response contract."""
        models = await self._repo.list()
        return ObligationListResponse(
            obligations=[
                present_obligation_list_item(
                    model,
                    business_today=self._business_today,
                    due_soon_window_days=self._due_soon_window_days,
                )
                for model in models
            ]
        )

    async def get(self, obligation_id: str) -> ObligationDetailResponse:
        """Return one obligation using the full detail response contract."""
        return self._detail(await self._repo.get(obligation_id))

    async def update(
        self,
        obligation_id: str,
        request: ObligationUpdateRequest,
    ) -> ObligationDetailResponse:
        """Update editable obligation fields without changing workflow status."""
        current = await self._repo.get(obligation_id)
        next_requires_document = (
            request.requires_document
            if request.requires_document is not None
            else current.requires_document
        )
        validate_requires_document_update(
            status=ObligationStatus(current.status),
            next_requires_document=next_requires_document,
            has_document=current.document is not None,
        )
        values = self._update_values(request)
        model = await self._repo.update_fields(
            obligation_id=obligation_id,
            expected_version=request.expected_version,
            values=values,
        )
        return self._detail(model)

    async def delete(self, obligation_id: str) -> dict[str, bool]:
        """Delete an obligation through the repository boundary."""
        await self._repo.delete(obligation_id)
        return {"deleted": True}

    async def attach_document(
        self,
        obligation_id: str,
        request: ObligationDocumentRequest,
    ) -> ObligationDetailResponse:
        """Attach document metadata and return the refreshed detail."""
        storage_key = (
            request.storage_key or f"mock://obligations/{obligation_id}/{request.file_name}"
        )
        model = await self._repo.attach_document(
            obligation_id=obligation_id,
            expected_version=request.expected_version,
            file_name=request.file_name,
            content_type=request.content_type,
            size_bytes=request.size_bytes,
            storage_key=storage_key,
        )
        return self._detail(model)

    async def delete_document(
        self,
        obligation_id: str,
        expected_version: int,
    ) -> ObligationDetailResponse:
        """Remove document metadata and return the refreshed detail."""
        current = await self._repo.get(obligation_id)
        validate_requires_document_update(
            status=ObligationStatus(current.status),
            next_requires_document=current.requires_document,
            has_document=False,
        )
        model = await self._repo.delete_document(
            obligation_id=obligation_id,
            expected_version=expected_version,
        )
        return self._detail(model)

    async def change_status(
        self,
        obligation_id: str,
        request: StatusChangeRequest,
    ) -> ObligationDetailResponse:
        """Validate and persist a workflow status transition."""
        current = await self._repo.get(obligation_id)
        current_status = ObligationStatus(current.status)
        validate_transition(current_status, request.target_status)
        validate_document_gate(
            target_status=request.target_status,
            requires_document=current.requires_document,
            has_document=current.document is not None,
        )
        model = await self._repo.change_status(
            obligation_id=obligation_id,
            expected_version=request.expected_version,
            target_status=request.target_status,
            reason=request.reason,
        )
        return self._detail(model)

    def _detail(self, model) -> ObligationDetailResponse:
        """Wrap an obligation model in the full detail response envelope."""
        return ObligationDetailResponse(
            obligation=present_obligation_detail(
                model,
                business_today=self._business_today,
                due_soon_window_days=self._due_soon_window_days,
            )
        )

    def _update_values(self, request: ObligationUpdateRequest) -> dict[str, Any]:
        """Convert an update request into repository-ready field values."""
        values = request.model_dump(
            exclude={"expected_version"},
            exclude_none=True,
        )
        if "type" in values:
            values["type"] = values["type"].value
        if "company_tax_id" in values:
            protected_tax_id = self._tax_id_protector.protect(values.pop("company_tax_id"))
            values["company_tax_id_encrypted"] = protected_tax_id.encrypted
            values["company_tax_id_last4"] = protected_tax_id.last4
        return values
