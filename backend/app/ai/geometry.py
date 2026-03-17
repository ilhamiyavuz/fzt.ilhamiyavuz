import math

from app.ai.types import Landmark


def _vector(start: Landmark, end: Landmark) -> tuple[float, float, float]:
    return (end.x - start.x, end.y - start.y, end.z - start.z)


def _norm(vector: tuple[float, float, float]) -> float:
    return math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2)


def calculate_angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    """B noktasındaki açıyı derece cinsinden hesaplar."""

    ba = _vector(b, a)
    bc = _vector(b, c)

    denominator = _norm(ba) * _norm(bc)
    if denominator == 0:
        return 0.0

    cos_value = max(-1.0, min(1.0, (ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2]) / denominator))
    return math.degrees(math.acos(cos_value))
