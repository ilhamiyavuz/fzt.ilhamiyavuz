from dataclasses import dataclass
from datetime import UTC, datetime

from app.ai.feedback import build_feedback
from app.ai.geometry import calculate_angle
from app.ai.types import Landmark
from app.schemas.ai_analysis import AIAnalysisResponse, ExerciseType


@dataclass
class RepState:
    rep_count: int = 0
    phase: str = "start"
    last_feedback: str | None = None


class MovementAnalyzer:
    """Squat, diz fleksiyon ve omuz abdüksiyon için temel tekrar + açı analizcisi."""

    def __init__(self) -> None:
        self.session_states: dict[str, RepState] = {}

    def _get_state(self, session_id: str) -> RepState:
        if session_id not in self.session_states:
            self.session_states[session_id] = RepState()
        return self.session_states[session_id]

    def _empty_result(self, session_id: str, exercise_type: ExerciseType, phase: str, rep_count: int, message: str) -> AIAnalysisResponse:
        return AIAnalysisResponse(
            analyzed_at=datetime.now(UTC),
            session_id=session_id,
            exercise_type=exercise_type,
            rep_count=rep_count,
            current_angle=0.0,
            phase=phase,
            form_score=0,
            feedback_text_tr=message,
            detected_errors=["landmark_tespit_edilemedi"],
        )

    def analyze(self, session_id: str, exercise_type: ExerciseType, landmarks: dict[str, Landmark]) -> AIAnalysisResponse:
        state = self._get_state(session_id)
        errors: list[str] = []

        if exercise_type in {ExerciseType.SQUAT, ExerciseType.KNEE_FLEXION}:
            required = ["left_hip", "left_knee", "left_ankle"]
            if any(key not in landmarks for key in required):
                return self._empty_result(
                    session_id,
                    exercise_type,
                    state.phase,
                    state.rep_count,
                    "Eklem noktaları net görünmüyor, kameraya biraz yaklaşın.",
                )

            angle = calculate_angle(landmarks["left_hip"], landmarks["left_knee"], landmarks["left_ankle"])

            if exercise_type == ExerciseType.SQUAT:
                down_threshold, up_threshold = 100.0, 160.0
                down_phase, up_phase = "down", "up"
            else:
                down_threshold, up_threshold = 95.0, 155.0
                down_phase, up_phase = "flex", "extend"

            if angle <= down_threshold and state.phase != down_phase:
                state.phase = down_phase
            elif angle >= up_threshold and state.phase == down_phase:
                state.phase = up_phase
                state.rep_count += 1

            if angle > 170:
                errors.append("hiperekstansiyon_riski")

        else:
            required = ["left_hip", "left_shoulder", "left_elbow"]
            if any(key not in landmarks for key in required):
                return self._empty_result(
                    session_id,
                    exercise_type,
                    state.phase,
                    state.rep_count,
                    "Omuz ve kol noktaları seçilemedi, kamerayı hizalayın.",
                )

            angle = calculate_angle(landmarks["left_hip"], landmarks["left_shoulder"], landmarks["left_elbow"])
            if angle >= 80 and state.phase != "raise":
                state.phase = "raise"
            elif angle <= 30 and state.phase == "raise":
                state.phase = "lower"
                state.rep_count += 1

            if angle > 140:
                errors.append("kompansasyon_olasiligi")

        form_score = max(0, min(100, int(100 - len(errors) * 20 - abs(90 - angle) * 0.2)))
        feedback = build_feedback(exercise_type, angle, state.phase, state.rep_count, state.last_feedback)
        state.last_feedback = feedback

        return AIAnalysisResponse(
            analyzed_at=datetime.now(UTC),
            session_id=session_id,
            exercise_type=exercise_type,
            rep_count=state.rep_count,
            current_angle=round(angle, 2),
            phase=state.phase,
            form_score=form_score,
            feedback_text_tr=feedback,
            detected_errors=errors,
        )
