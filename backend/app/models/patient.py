from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDTimestampMixin


class Patient(UUIDTimestampMixin, Base):
    __tablename__ = "patients"

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    physiotherapist_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("physiotherapists.id"), index=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(20))
    height_cm: Mapped[float | None] = mapped_column(Numeric(5, 2))
    weight_kg: Mapped[float | None] = mapped_column(Numeric(5, 2))
    rehab_phase: Mapped[str | None] = mapped_column(String(60))

    user = relationship("User", back_populates="patient_profile")
    physiotherapist = relationship("Physiotherapist", back_populates="patients")
    diagnoses = relationship("Diagnosis", back_populates="patient")
    pain_logs = relationship("PainLog", back_populates="patient")
    programs = relationship("ExerciseProgram", back_populates="patient")
    sessions = relationship("ExerciseSession", back_populates="patient")
