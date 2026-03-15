from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles
from app.models.clinical import PainLog
from app.models.exercise import ExerciseProgram, ExerciseSession
from app.models.patient import Patient
from app.models.physiotherapist import Physiotherapist
from app.models.user import User, UserRole

router = APIRouter()


def _get_physio_or_404(db: Session, current_user: User) -> Physiotherapist:
    physio = db.query(Physiotherapist).filter(Physiotherapist.user_id == current_user.id).first()
    if not physio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fizyoterapist profili bulunamadı")
    return physio


@router.get("/me/dashboard")
def my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> dict:
    physio = _get_physio_or_404(db, current_user) if current_user.role == UserRole.PHYSIOTHERAPIST else None

    total_active_patients = (
        db.query(Patient).filter(Patient.physiotherapist_id == physio.id).count() if physio else db.query(Patient).count()
    )

    patient_ids = [p.id for p in db.query(Patient).filter(Patient.physiotherapist_id == physio.id).all()] if physio else []
    today_session_count = (
        db.query(ExerciseSession).filter(ExerciseSession.patient_id.in_(patient_ids)).count() if patient_ids else 0
    )
    active_program_count = (
        db.query(ExerciseProgram)
        .filter(ExerciseProgram.patient_id.in_(patient_ids), ExerciseProgram.status == "active")
        .count()
        if patient_ids
        else 0
    )

    return {
        "total_active_patients": total_active_patients,
        "today_exercised_count": today_session_count,
        "active_program_count": active_program_count,
        "message": "Dashboard verisi başarıyla getirildi",
    }


@router.get("/patients/{patient_id}/follow-up")
def patient_follow_up(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> dict:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hasta bulunamadı")

    if current_user.role == UserRole.PHYSIOTHERAPIST:
        physio = _get_physio_or_404(db, current_user)
        if patient.physiotherapist_id != physio.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu hastayı görüntüleme yetkiniz yok")

    sessions = (
        db.query(ExerciseSession)
        .filter(ExerciseSession.patient_id == patient.id)
        .order_by(ExerciseSession.created_at.desc())
        .limit(10)
        .all()
    )
    pain_logs = (
        db.query(PainLog)
        .filter(PainLog.patient_id == patient.id)
        .order_by(PainLog.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "patient": {
            "id": str(patient.id),
            "full_name": patient.full_name,
            "rehab_phase": patient.rehab_phase,
        },
        "recent_sessions": [
            {
                "session_id": str(item.id),
                "started_at": item.started_at,
                "completion_rate": item.completion_rate,
                "ai_score_avg": item.ai_score_avg,
                "pain_before": item.pain_before,
                "pain_after": item.pain_after,
            }
            for item in sessions
        ],
        "recent_pain_logs": [
            {
                "pain_log_id": str(item.id),
                "pain_level": item.pain_level,
                "fatigue_level": item.fatigue_level,
                "stiffness_level": item.stiffness_level,
                "swelling_level": item.swelling_level,
                "note_tr": item.note_tr,
                "created_at": item.created_at,
            }
            for item in pain_logs
        ],
    }
