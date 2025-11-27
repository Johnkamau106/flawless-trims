"""create clips table

Revision ID: 20241127_0001
Revises: 
Create Date: 2025-11-27 11:45:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20241127_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clips",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("platform", sa.String(length=64), nullable=True),
        sa.Column("thumbnail_url", sa.String(length=1024), nullable=True),
        sa.Column("format_label", sa.String(length=64), nullable=False),
        sa.Column("start_time", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("end_time", sa.Integer(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("file_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_clips_created_at"), "clips", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_clips_created_at"), table_name="clips")
    op.drop_table("clips")

