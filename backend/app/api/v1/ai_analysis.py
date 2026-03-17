from fastapi import APIRouter, Depends, HTTPException, status

from app.ai.analyzer import MovementAnalyzer
from app.ai.service import AIFrameService
from app.ai.types import Landmark
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.ai_analysis import AIAnalysisRequest, AIAnalysisResponse, AIImageAnalysisRequest

router = APIRouter()
_analyzer = MovementAnalyzer()
_frame_service = AIFrameService()


@router.post("/session-frame", response_model=AIAnalysisResponse)
def analyze_session_frame(
    payload: AIAnalysisRequest,
    _: User = Depends(get_current_user),
) -> AIAnalysisResponse:
    landmarks = {
        key: Landmark(x=value.x, y=value.y, z=value.z, visibility=value.visibility)
        for key, value in payload.landmarks.items()
    }

    return _analyzer.analyze(str(payload.session_id), payload.exercise_type, landmarks)


@router.post("/session-image", response_model=AIAnalysisResponse)
def analyze_session_image(
    payload: AIImageAnalysisRequest,
    _: User = Depends(get_current_user),
) -> AIAnalysisResponse:
    try:
        landmarks = _frame_service.landmarks_from_base64(payload.frame_base64)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Görüntü çözümlenemedi, lütfen geçerli bir kare gönderin.",
        ) from exc

    return _analyzer.analyze(str(payload.session_id), payload.exercise_type, landmarks)
