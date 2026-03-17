from app.schemas.ai_analysis import ExerciseType


def build_feedback(
    exercise_type: ExerciseType,
    angle: float,
    phase: str,
    rep_count: int,
    last_feedback: str | None = None,
) -> str:
    """Egzersiz tipine göre motive edici Türkçe geri bildirim üretir."""

    if exercise_type == ExerciseType.SQUAT:
        if phase == "down" and angle > 120:
            feedback = "Biraz daha kontrollü inin, diz açınızı artırabilirsiniz."
        elif phase == "up" and angle < 155:
            feedback = "Yukarı çıkarken dizlerinizi tam açmaya yaklaşın."
        else:
            feedback = "Çok iyi gidiyorsunuz, hareket formunuz dengeli."
    elif exercise_type == ExerciseType.KNEE_FLEXION:
        if phase == "flex" and angle > 110:
            feedback = "Dizinizi biraz daha bükmeyi deneyin."
        elif phase == "extend" and angle < 150:
            feedback = "Açarken hareketi yavaş ve kontrollü tamamlayın."
        else:
            feedback = "Bu tekrar daha düzgün oldu, aynı tempoda devam edin."
    else:  # SHOULDER_ABDUCTION
        if phase == "raise" and angle < 70:
            feedback = "Kolunuzu biraz daha yana ve yukarı kaldırın."
        elif phase == "lower" and angle > 40:
            feedback = "İndirirken omzunuzu rahat bırakın ve kontrolü koruyun."
        else:
            feedback = "Harika, omuz hareketiniz hedef aralığa yaklaştı."

    if last_feedback == feedback:
        return "Gayet iyi devam ediyorsunuz, ritmi koruyun."

    if rep_count > 0 and rep_count % 5 == 0:
        return "Tebrikler, bu seti güçlü şekilde sürdürüyoruz."

    return feedback
