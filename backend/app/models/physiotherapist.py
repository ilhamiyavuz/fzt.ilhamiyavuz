from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDTimestampMixin


class Physiotherapist(UUIDTimestampMixin, Base):
    __tablename__ = "physiotherapists"

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    license_no: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    specialty: Mapped[str | None] = mapped_column(String(100))
    clinic_name: Mapped[str | None] = mapped_column(String(150))

    user = relationship("User", back_populates="physiotherapist_profile")
    patients = relationship("Patient", back_populates="physiotherapist")
