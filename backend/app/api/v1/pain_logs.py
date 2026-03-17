from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles
from app.models.clinical import PainLog
from app.models.patient import Patient
from app.models.physiotherapist import Physiotherapist
from app.models.user import User, UserRole
from app.schemas.pain_log import PainLogCreateRequest, PainLogResponse

router = APIRouter()


@router.post("", response_model=PainLogResponse, status_code=status.HTTP_201_CREATED)
def create_pain_log(
    payload: PainLogCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PATIENT, UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> PainLogResponse:
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hasta bulunamadı")

    if current_user.role == UserRole.PATIENT and patient.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece kendi ağrı günlüğünüzü girebilirsiniz")

    pain_log = PainLog(**payload.model_dump())
    db.add(pain_log)
    db.commit()
    db.refresh(pain_log)

    return PainLogResponse.model_validate(pain_log)


@router.get("/patient/{patient_id}", response_model=list[PainLogResponse])
def list_patient_pain_logs(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> list[PainLogResponse]:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return []

    if current_user.role == UserRole.PHYSIOTHERAPIST:
        physio = db.query(Physiotherapist).filter(Physiotherapist.user_id == current_user.id).first()
        if not physio or patient.physiotherapist_id != physio.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu hastanın verisini görüntüleme yetkiniz yok")

    logs = db.query(PainLog).filter(PainLog.patient_id == patient.id).order_by(PainLog.created_at.desc()).all()
    return [PainLogResponse.model_validate(item) for item in logs]
