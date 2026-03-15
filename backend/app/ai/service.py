import base64
from io import BytesIO

import numpy as np
from PIL import Image

from app.ai.mediapipe_pose import MediaPipePoseExtractor
from app.ai.types import Landmark


class AIFrameService:
    """Base64 görselden MediaPipe landmark çıkarımı yapar."""

    def __init__(self) -> None:
        self.extractor = MediaPipePoseExtractor()

    def landmarks_from_base64(self, frame_base64: str) -> dict[str, Landmark]:
        image_bytes = base64.b64decode(frame_base64)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        rgb_array = np.array(image)
        return self.extractor.from_rgb_array(rgb_array)
