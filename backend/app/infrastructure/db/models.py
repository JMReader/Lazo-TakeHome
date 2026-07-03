from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def new_id() -> str:
    """Generate string UUID primary keys for persisted rows."""
    return str(uuid4())


def now_utc() -> datetime:
    """Provide timezone-aware UTC timestamps for model defaults."""
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class ObligationModel(Base):
    __tablename__ = "obligations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    due_date: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    requires_document: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    company_tax_id_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    company_tax_id_last4: Mapped[str] = mapped_column(String(16), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    document: Mapped["ObligationDocumentModel | None"] = relationship(
        back_populates="obligation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    audit_events: Mapped[list["ObligationStatusAuditModel"]] = relationship(
        back_populates="obligation",
        cascade="all, delete-orphan",
        order_by="ObligationStatusAuditModel.changed_at",
        lazy="selectin",
    )


class ObligationDocumentModel(Base):
    __tablename__ = "obligation_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    obligation_id: Mapped[str] = mapped_column(
        ForeignKey("obligations.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(255), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    uploaded_by: Mapped[str] = mapped_column(String(255), nullable=False, default="demo-user")

    obligation: Mapped[ObligationModel] = relationship(back_populates="document")


class ObligationStatusAuditModel(Base):
    __tablename__ = "obligation_status_audit"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    obligation_id: Mapped[str] = mapped_column(
        ForeignKey("obligations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_status: Mapped[str] = mapped_column(String(32), nullable=False)
    to_status: Mapped[str] = mapped_column(String(32), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    changed_by: Mapped[str] = mapped_column(String(255), nullable=False, default="demo-user")
    obligation_version: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    obligation: Mapped[ObligationModel] = relationship(back_populates="audit_events")
