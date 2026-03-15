import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ExerciseType(str, Enum):
    SQUAT = "squat"
    KNEE_FLEXION = "knee_flexion"
    SHOULDER_ABDUCTION = "shoulder_abduction"


class LandmarkPayload(BaseModel):
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    z: float = 0.0
    visibility: float = Field(default=1.0, ge=0, le=1)


class AIAnalysisRequest(BaseModel):
    session_id: uuid.UUID
    exercise_type: ExerciseType
    landmarks: dict[str, LandmarkPayload]


class AIImageAnalysisRequest(BaseModel):
    session_id: uuid.UUID
    exercise_type: ExerciseType
    frame_base64: str = Field(description="Base64 kodlu RGB görüntü")


class AIAnalysisResponse(BaseModel):
    status: str = "ok"
    message: str = "Analiz başarılı"
    analyzed_at: datetime
    session_id: str
    exercise_type: ExerciseType
    rep_count: int
    current_angle: float
    phase: str
    form_score: int
    feedback_text_tr: str
    detected_errors: list[str]
