"""initial schema

Revision ID: 0001_initial_schema
Revises: None
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("admin", "physiotherapist", "patient", "caregiver", name="user_role")
    user_role.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(20), nullable=True, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_phone", "users", ["phone"])

    op.create_table(
        "physiotherapists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("license_no", sa.String(60), nullable=False, unique=True),
        sa.Column("specialty", sa.String(100), nullable=True),
        sa.Column("clinic_name", sa.String(150), nullable=True),
    )

    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("physiotherapist_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("physiotherapists.id"), nullable=False),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("height_cm", sa.Numeric(5, 2), nullable=True),
        sa.Column("weight_kg", sa.Numeric(5, 2), nullable=True),
        sa.Column("rehab_phase", sa.String(60), nullable=True),
    )

    op.create_table(
        "exercise_library",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("name_tr", sa.String(120), nullable=False),
        sa.Column("description_tr", sa.Text(), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("difficulty_level", sa.String(40), nullable=True),
        sa.Column("target_joints", postgresql.JSONB(), nullable=True),
        sa.Column("media_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )

    op.create_table(
        "exercise_programs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("physiotherapist_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("physiotherapists.id"), nullable=False),
        sa.Column("title_tr", sa.String(180), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
    )

    op.create_table(
        "exercise_program_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("program_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("exercise_programs.id"), nullable=False),
        sa.Column("exercise_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("exercise_library.id"), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("sets", sa.Integer(), nullable=False),
        sa.Column("reps", sa.Integer(), nullable=False),
        sa.Column("hold_seconds", sa.Integer(), nullable=True),
        sa.Column("rest_seconds", sa.Integer(), nullable=True),
        sa.Column("order_no", sa.Integer(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_table("exercise_program_items")
    op.drop_table("exercise_programs")
    op.drop_table("exercise_library")
    op.drop_table("patients")
    op.drop_table("physiotherapists")
    op.drop_index("ix_users_phone", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
