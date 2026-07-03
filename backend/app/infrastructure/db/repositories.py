from datetime import UTC, date, datetime
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.exceptions import ObligationNotFound, ObligationVersionConflict
from app.domain.obligations import ObligationStatus
from app.infrastructure.db.models import (
    ObligationDocumentModel,
    ObligationModel,
    ObligationStatusAuditModel,
)


class ObligationRepository:
    def __init__(self, session: AsyncSession) -> None:
        """Store obligation data through an async SQLAlchemy session."""
        self._session = session

    async def create(
        self,
        *,
        type: str,
        title: str,
        description: str,
        due_date: date,
        owner: str,
        requires_document: bool,
        company_tax_id_encrypted: str,
        company_tax_id_last4: str,
    ) -> ObligationModel:
        """Persist a new pending obligation."""
        model = ObligationModel(
            type=type,
            title=title,
            description=description,
            due_date=due_date,
            owner=owner,
            requires_document=requires_document,
            company_tax_id_encrypted=company_tax_id_encrypted,
            company_tax_id_last4=company_tax_id_last4,
            status=ObligationStatus.PENDING.value,
            version=1,
        )
        self._session.add(model)
        await self._session.flush()
        return await self.get(model.id)

    async def list(self) -> list[ObligationModel]:
        """Load obligations ordered for list views."""
        result = await self._session.execute(
            select(ObligationModel)
            .options(
                selectinload(ObligationModel.document),
                selectinload(ObligationModel.audit_events),
            )
            .order_by(ObligationModel.due_date.asc())
        )
        return list(result.scalars())

    async def get(self, obligation_id: str) -> ObligationModel:
        """Load one obligation with related document and audit state."""
        result = await self._session.execute(
            select(ObligationModel)
            .where(ObligationModel.id == obligation_id)
            .options(
                selectinload(ObligationModel.document),
                selectinload(ObligationModel.audit_events),
            )
            .execution_options(populate_existing=True)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ObligationNotFound("Obligation not found.")
        return model

    async def delete(self, obligation_id: str) -> None:
        """Remove an obligation and cascade owned rows."""
        model = await self.get(obligation_id)
        await self._session.delete(model)
        await self._session.flush()

    async def update_fields(
        self,
        *,
        obligation_id: str,
        expected_version: int,
        values: dict[str, Any],
    ) -> ObligationModel:
        """Apply field updates only when the expected version matches."""
        await self._conditional_bump(
            obligation_id=obligation_id,
            expected_version=expected_version,
            values=values,
        )
        return await self.get(obligation_id)

    async def attach_document(
        self,
        *,
        obligation_id: str,
        expected_version: int,
        file_name: str,
        content_type: str,
        size_bytes: int,
        storage_key: str,
    ) -> ObligationModel:
        """Create or replace document metadata under optimistic locking."""
        await self._conditional_bump(
            obligation_id=obligation_id,
            expected_version=expected_version,
            values={},
        )
        current = await self.get(obligation_id)
        if current.document is None:
            self._session.add(
                ObligationDocumentModel(
                    obligation_id=obligation_id,
                    file_name=file_name,
                    content_type=content_type,
                    size_bytes=size_bytes,
                    storage_key=storage_key,
                )
            )
        else:
            current.document.file_name = file_name
            current.document.content_type = content_type
            current.document.size_bytes = size_bytes
            current.document.storage_key = storage_key
            current.document.uploaded_at = datetime.now(UTC)
        await self._session.flush()
        return await self.get(obligation_id)

    async def delete_document(
        self, *, obligation_id: str, expected_version: int
    ) -> ObligationModel:
        """Delete document metadata under optimistic locking."""
        await self._conditional_bump(
            obligation_id=obligation_id,
            expected_version=expected_version,
            values={},
        )
        current = await self.get(obligation_id)
        if current.document is not None:
            await self._session.delete(current.document)
            await self._session.flush()
        return await self.get(obligation_id)

    async def change_status(
        self,
        *,
        obligation_id: str,
        expected_version: int,
        target_status: ObligationStatus,
        reason: str | None,
    ) -> ObligationModel:
        """Persist a status change and its audit record atomically."""
        current = await self.get(obligation_id)
        previous_status = current.status
        await self._conditional_bump(
            obligation_id=obligation_id,
            expected_version=expected_version,
            values={"status": target_status.value},
        )
        self._session.add(
            ObligationStatusAuditModel(
                obligation_id=obligation_id,
                from_status=previous_status,
                to_status=target_status.value,
                obligation_version=expected_version + 1,
                reason=reason,
            )
        )
        await self._session.flush()
        return await self.get(obligation_id)

    async def _conditional_bump(
        self,
        *,
        obligation_id: str,
        expected_version: int,
        values: dict[str, Any],
    ) -> None:
        """Increment the version only when the current row matches expectations."""
        statement = (
            update(ObligationModel)
            .where(ObligationModel.id == obligation_id, ObligationModel.version == expected_version)
            .values(**values, version=expected_version + 1, updated_at=datetime.now(UTC))
        )
        result = await self._session.execute(statement)
        if result.rowcount == 0:
            exists = await self._session.scalar(
                select(ObligationModel.id).where(ObligationModel.id == obligation_id)
            )
            if exists is None:
                raise ObligationNotFound("Obligation not found.")
            raise ObligationVersionConflict(
                "The obligation was modified by another request. Please refresh and try again."
            )
        await self._session.flush()
