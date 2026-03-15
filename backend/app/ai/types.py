from dataclasses import dataclass


@dataclass
class Landmark:
    """Normalize edilmiş landmark koordinatı."""

    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0
