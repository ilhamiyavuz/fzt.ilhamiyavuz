import uuid
from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class ExerciseCreateRequest(BaseModel):
    name_tr: str = Field(min_length=2, max_length=120)
    description_tr: str = Field(min_length=5)
    category: str
    difficulty_level: str | None = None
    target_joints: dict | None = None
    media_url: str | None = None


class ExerciseResponse(ORMBase):
    id: uuid.UUID
    name_tr: str
    description_tr: str
    category: str


class ExerciseProgramItemCreate(BaseModel):
    exercise_id: uuid.UUID
    day_of_week: int = Field(ge=1, le=7)
    sets: int = Field(ge=1, le=20)
    reps: int = Field(ge=1, le=200)
    hold_seconds: int | None = Field(default=None, ge=0, le=120)
    rest_seconds: int | None = Field(default=None, ge=0, le=300)
    order_no: int = Field(default=1, ge=1)


class ExerciseProgramCreateRequest(BaseModel):
    patient_id: uuid.UUID
    title_tr: str
    start_date: date
    end_date: date | None = None
    items: list[ExerciseProgramItemCreate]


class StartSessionRequest(BaseModel):
    patient_id: uuid.UUID
    program_item_id: uuid.UUID
