import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PainLogCreateRequest(BaseModel):
    patient_id: uuid.UUID
    pain_level: int = Field(ge=0, le=10)
    fatigue_level: int | None = Field(default=None, ge=0, le=10)
    stiffness_level: int | None = Field(default=None, ge=0, le=10)
    swelling_level: int | None = Field(default=None, ge=0, le=10)
    note_tr: str | None = None


class PainLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    pain_level: int
    fatigue_level: int | None
    stiffness_level: int | None
    swelling_level: int | None
    note_tr: str | None
    created_at: datetime
