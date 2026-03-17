import enum

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDTimestampMixin


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PHYSIOTHERAPIST = "physiotherapist"
    PATIENT = "patient"
    CAREGIVER = "caregiver"


class User(UUIDTimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    physiotherapist_profile = relationship("Physiotherapist", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
