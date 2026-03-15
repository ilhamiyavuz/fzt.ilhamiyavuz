from datetime import UTC, date, datetime

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.clinical import PainLog
from app.models.exercise import ExerciseLibrary, ExerciseProgram, ExerciseProgramItem, ExerciseSession
from app.models.patient import Patient
from app.models.physiotherapist import Physiotherapist
from app.models.user import User, UserRole


def run() -> None:
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "fzt.demo@platform.local").first():
            print("Demo verisi zaten mevcut.")
            return

        physio_user = User(
            email="fzt.demo@platform.local",
            phone="5550000001",
            password_hash=get_password_hash("Demo1234!"),
            role=UserRole.PHYSIOTHERAPIST,
        )
        db.add(physio_user)
        db.flush()

        physio = Physiotherapist(
            user_id=physio_user.id,
            full_name="Uzm. Fzt. Ayşe Yılmaz",
            license_no="TR-FZT-0001",
            specialty="Ortopedik Rehabilitasyon",
            clinic_name="Fizio Demo Klinik",
        )
        db.add(physio)
        db.flush()

        patient_user = User(
            email="hasta.demo@platform.local",
            phone="5550000002",
            password_hash=get_password_hash("Demo1234!"),
            role=UserRole.PATIENT,
        )
        db.add(patient_user)
        db.flush()

        patient = Patient(
            user_id=patient_user.id,
            physiotherapist_id=physio.id,
            full_name="Mehmet Kaya",
            birth_date=date(1990, 5, 17),
            gender="Erkek",
            height_cm=178,
            weight_kg=82,
            rehab_phase="Erken Faz",
        )
        db.add(patient)
        db.flush()

        knee_flexion = ExerciseLibrary(
            name_tr="Diz Fleksiyon",
            description_tr="Dizi kontrollü bükme ve açma hareketi.",
            category="Diz",
            difficulty_level="Kolay",
            target_joints={"primary": ["diz"]},
            media_url="https://example.com/knee-flexion.mp4",
        )
        squat = ExerciseLibrary(
            name_tr="Squat",
            description_tr="Ayaklar omuz genişliğinde, kontrollü in-çık hareketi.",
            category="Alt Ekstremite",
            difficulty_level="Orta",
            target_joints={"primary": ["diz", "kalça"]},
            media_url="https://example.com/squat.mp4",
        )
        db.add_all([knee_flexion, squat])
        db.flush()

        program = ExerciseProgram(
            patient_id=patient.id,
            physiotherapist_id=physio.id,
            title_tr="Diz Rehabilitasyon Demo Programı",
            start_date=date.today(),
            status="active",
        )
        db.add(program)
        db.flush()

        item = ExerciseProgramItem(
            program_id=program.id,
            exercise_id=knee_flexion.id,
            day_of_week=1,
            sets=3,
            reps=12,
            hold_seconds=1,
            rest_seconds=20,
            order_no=1,
        )
        db.add(item)
        db.flush()

        session = ExerciseSession(
            patient_id=patient.id,
            program_item_id=item.id,
            started_at=datetime.now(UTC),
            completion_rate=80,
            ai_score_avg=84,
            pain_before=5,
            pain_after=4,
        )
        db.add(session)

        pain_log = PainLog(
            patient_id=patient.id,
            pain_level=4,
            fatigue_level=3,
            stiffness_level=2,
            swelling_level=1,
            note_tr="Egzersiz sonrası dizimde hafif rahatlama oldu.",
        )
        db.add(pain_log)

        db.commit()
        print("Demo verileri başarıyla eklendi.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
