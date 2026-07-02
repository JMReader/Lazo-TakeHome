"""create obligations tables

Revision ID: 20260702_0001
Revises:
Create Date: 2026-07-02
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260702_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "obligations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("owner", sa.String(length=255), nullable=False),
        sa.Column("requires_document", sa.Boolean(), nullable=False),
        sa.Column("company_tax_id_encrypted", sa.Text(), nullable=False),
        sa.Column("company_tax_id_last4", sa.String(length=16), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_obligations_due_date", "obligations", ["due_date"])
    op.create_index("ix_obligations_status", "obligations", ["status"])
    op.create_index("ix_obligations_type", "obligations", ["type"])

    op.create_table(
        "obligation_documents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("obligation_id", sa.String(length=36), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=255), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("storage_key", sa.Text(), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("uploaded_by", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["obligation_id"], ["obligations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("obligation_id"),
    )
    op.create_index(
        "ix_obligation_documents_obligation_id",
        "obligation_documents",
        ["obligation_id"],
    )

    op.create_table(
        "obligation_status_audit",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("obligation_id", sa.String(length=36), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=False),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("changed_by", sa.String(length=255), nullable=False),
        sa.Column("obligation_version", sa.Integer(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["obligation_id"], ["obligations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_obligation_status_audit_obligation_id",
        "obligation_status_audit",
        ["obligation_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_obligation_status_audit_obligation_id", table_name="obligation_status_audit")
    op.drop_table("obligation_status_audit")
    op.drop_index("ix_obligation_documents_obligation_id", table_name="obligation_documents")
    op.drop_table("obligation_documents")
    op.drop_index("ix_obligations_type", table_name="obligations")
    op.drop_index("ix_obligations_status", table_name="obligations")
    op.drop_index("ix_obligations_due_date", table_name="obligations")
    op.drop_table("obligations")
