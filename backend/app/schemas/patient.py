import uuid
from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMBase


class PatientCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    birth_date: date | None = None
    gender: str | None = None
    height_cm: float | None = Field(default=None, ge=30, le=250)
    weight_kg: float | None = Field(default=None, ge=2, le=400)
    rehab_phase: str | None = None
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    physiotherapist_id: uuid.UUID | None = None


class PatientResponse(ORMBase):
    id: uuid.UUID
    full_name: str
    rehab_phase: str | None
