from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDTimestampMixin


class ExerciseLibrary(UUIDTimestampMixin, Base):
    __tablename__ = "exercise_library"

    name_tr: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    description_tr: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    difficulty_level: Mapped[str | None] = mapped_column(String(40))
    target_joints: Mapped[dict | None] = mapped_column(JSONB)
    media_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ExerciseProgram(UUIDTimestampMixin, Base):
    __tablename__ = "exercise_programs"

    patient_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    physiotherapist_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("physiotherapists.id"), nullable=False)
    title_tr: Mapped[str] = mapped_column(String(180), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="active", index=True, nullable=False)

    patient = relationship("Patient", back_populates="programs")
    items = relationship("ExerciseProgramItem", back_populates="program", cascade="all, delete-orphan")


class ExerciseProgramItem(UUIDTimestampMixin, Base):
    __tablename__ = "exercise_program_items"

    program_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercise_programs.id"), index=True, nullable=False
    )
    exercise_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exercise_library.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    sets: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    hold_seconds: Mapped[int | None] = mapped_column(Integer)
    rest_seconds: Mapped[int | None] = mapped_column(Integer)
    order_no: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    program = relationship("ExerciseProgram", back_populates="items")
    exercise = relationship("ExerciseLibrary")


class ExerciseSession(UUIDTimestampMixin, Base):
    __tablename__ = "exercise_sessions"

    patient_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    program_item_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exercise_program_items.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completion_rate: Mapped[float | None] = mapped_column(Float)
    ai_score_avg: Mapped[float | None] = mapped_column(Float)
    pain_before: Mapped[int | None] = mapped_column(Integer)
    pain_after: Mapped[int | None] = mapped_column(Integer)

    patient = relationship("Patient", back_populates="sessions")
    repetition_logs = relationship("ExerciseRepetitionLog", back_populates="session", cascade="all, delete-orphan")


class ExerciseRepetitionLog(UUIDTimestampMixin, Base):
    __tablename__ = "exercise_repetition_logs"

    session_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exercise_sessions.id"), index=True, nullable=False)
    rep_no: Mapped[int] = mapped_column(Integer, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    movement_score: Mapped[float | None] = mapped_column(Float)
    error_type: Mapped[str | None] = mapped_column(String(120))
    min_angle: Mapped[float | None] = mapped_column(Float)
    max_angle: Mapped[float | None] = mapped_column(Float)
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    session = relationship("ExerciseSession", back_populates="repetition_logs")
