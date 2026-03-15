from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.core.security import get_password_hash
from app.models.exercise import ExerciseProgram, ExerciseProgramItem
from app.models.patient import Patient
from app.models.physiotherapist import Physiotherapist
from app.models.user import User, UserRole
from app.schemas.patient import PatientCreateRequest, PatientResponse

router = APIRouter()


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> PatientResponse:
    target_physio_id = None

    if current_user.role == UserRole.PHYSIOTHERAPIST:
        physio = db.query(Physiotherapist).filter(Physiotherapist.user_id == current_user.id).first()
        if not physio:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fizyoterapist profili bulunamadı")
        target_physio_id = physio.id
    else:
        if not payload.physiotherapist_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Admin kullanıcı hasta oluştururken physiotherapist_id göndermelidir",
            )
        physio = db.query(Physiotherapist).filter(Physiotherapist.id == payload.physiotherapist_id).first()
        if not physio:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fizyoterapist bulunamadı")
        target_physio_id = physio.id

    existing_user = db.query(User).filter(User.email == str(payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu e-posta ile kayıtlı kullanıcı zaten var")

    user = User(
        email=str(payload.email),
        password_hash=get_password_hash(payload.password),
        role=UserRole.PATIENT,
    )
    db.add(user)
    db.flush()

    patient = Patient(
        user_id=user.id,
        physiotherapist_id=target_physio_id,
        full_name=payload.full_name,
        birth_date=payload.birth_date,
        gender=payload.gender,
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        rehab_phase=payload.rehab_phase,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientResponse.model_validate(patient)


@router.get("", response_model=list[PatientResponse])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN)),
) -> list[PatientResponse]:
    query = db.query(Patient)
    if current_user.role == UserRole.PHYSIOTHERAPIST:
        physio = db.query(Physiotherapist).filter(Physiotherapist.user_id == current_user.id).first()
        if not physio:
            return []
        query = query.filter(Patient.physiotherapist_id == physio.id)

    return [PatientResponse.model_validate(item) for item in query.order_by(Patient.created_at.desc()).all()]


@router.get("/me/today-plan")
def get_my_today_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
) -> dict:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return {"items": [], "message": "Hasta profili bulunamadı"}

    program = (
        db.query(ExerciseProgram)
        .filter(ExerciseProgram.patient_id == patient.id, ExerciseProgram.status == "active")
        .order_by(ExerciseProgram.created_at.desc())
        .first()
    )
    if not program:
        return {"items": [], "message": "Aktif egzersiz programı bulunamadı"}

    items = (
        db.query(ExerciseProgramItem)
        .filter(ExerciseProgramItem.program_id == program.id)
        .order_by(ExerciseProgramItem.order_no.asc())
        .all()
    )

    serialized = [
        {
            "program_item_id": str(item.id),
            "exercise_id": str(item.exercise_id),
            "day_of_week": item.day_of_week,
            "sets": item.sets,
            "reps": item.reps,
            "hold_seconds": item.hold_seconds,
            "rest_seconds": item.rest_seconds,
            "order_no": item.order_no,
        }
        for item in items
    ]

    return {"program_id": str(program.id), "title_tr": program.title_tr, "items": serialized}
