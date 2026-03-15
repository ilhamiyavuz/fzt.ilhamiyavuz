from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDTimestampMixin


class Diagnosis(UUIDTimestampMixin, Base):
    __tablename__ = "diagnoses"

    patient_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    physiotherapist_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("physiotherapists.id"), nullable=False)
    diagnosis_code: Mapped[str | None] = mapped_column(String(30), index=True)
    diagnosis_text: Mapped[str] = mapped_column(Text, nullable=False)
    operation_date: Mapped[date | None] = mapped_column(Date)
    stage: Mapped[str | None] = mapped_column(String(60))

    patient = relationship("Patient", back_populates="diagnoses")


class PainLog(UUIDTimestampMixin, Base):
    __tablename__ = "pain_logs"

    patient_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    pain_level: Mapped[int] = mapped_column(nullable=False)
    fatigue_level: Mapped[int | None] = mapped_column()
    stiffness_level: Mapped[int | None] = mapped_column()
    swelling_level: Mapped[int | None] = mapped_column()
    note_tr: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient", back_populates="pain_logs")


class ClinicalNote(UUIDTimestampMixin, Base):
    __tablename__ = "clinical_notes"

    patient_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=False)
    physiotherapist_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("physiotherapists.id"), nullable=False)
    raw_note_tr: Mapped[str] = mapped_column(Text, nullable=False)
    structured_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    summary_tr: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(20), default="text", nullable=False)
    approved_by_user: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
