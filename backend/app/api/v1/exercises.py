from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.models.exercise import ExerciseLibrary, ExerciseProgram, ExerciseProgramItem, ExerciseSession
from app.models.patient import Patient
from app.models.physiotherapist import Physiotherapist
from app.models.user import User, UserRole
from app.schemas.exercise import (
    ExerciseCreateRequest,
    ExerciseProgramCreateRequest,
    ExerciseResponse,
    StartSessionRequest,
)

router = APIRouter()


@router.get("/library", response_model=list[ExerciseResponse])
def list_exercise_library(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ExerciseResponse]:
    items = db.query(ExerciseLibrary).filter(ExerciseLibrary.is_active.is_(True)).all()
    return [ExerciseResponse.model_validate(item) for item in items]


@router.post("/library", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    payload: ExerciseCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST)),
) -> ExerciseResponse:
    exercise = ExerciseLibrary(**payload.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return ExerciseResponse.model_validate(exercise)


@router.post("/programs", status_code=status.HTTP_201_CREATED)
def create_program(
    payload: ExerciseProgramCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> dict[str, str]:
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hasta bulunamadı")

    physiotherapist = db.query(Physiotherapist).filter(Physiotherapist.user_id == current_user.id).first()
    if current_user.role == UserRole.PHYSIOTHERAPIST and not physiotherapist:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fizyoterapist profili bulunamadı")

    physiotherapist_id = physiotherapist.id if physiotherapist else patient.physiotherapist_id

    program = ExerciseProgram(
        patient_id=payload.patient_id,
        physiotherapist_id=physiotherapist_id,
        title_tr=payload.title_tr,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(program)
    db.flush()

    for item in payload.items:
        db.add(ExerciseProgramItem(program_id=program.id, **item.model_dump()))

    db.commit()
    return {"program_id": str(program.id), "message": "Egzersiz programı oluşturuldu"}


@router.post("/sessions/start")
def start_session(
    payload: StartSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PATIENT, UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> dict[str, str]:
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hasta bulunamadı")

    if current_user.role == UserRole.PATIENT and patient.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi seansınızı başlatabilirsiniz")

    session = ExerciseSession(
        patient_id=payload.patient_id,
        program_item_id=payload.program_item_id,
        started_at=datetime.now(UTC),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": str(session.id),
        "message": "Egzersiz seansı başlatıldı",
        "websocket_url": f"/api/v1/ai-analysis/live/{session.id}",
    }
