import mediapipe as mp
import numpy as np

from app.ai.types import Landmark
from app.core.config import settings


class MediaPipePoseExtractor:
    """MediaPipe Pose ile görüntüden landmark çıkarımı."""

    def __init__(self) -> None:
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=settings.ai_min_detection_confidence,
            min_tracking_confidence=settings.ai_min_tracking_confidence,
        )

    def from_rgb_array(self, frame_rgb: np.ndarray) -> dict[str, Landmark]:
        result = self.pose.process(frame_rgb)
        if not result.pose_landmarks:
            return {}

        lm = result.pose_landmarks.landmark
        return {
            "left_hip": Landmark(
                lm[self.mp_pose.PoseLandmark.LEFT_HIP].x,
                lm[self.mp_pose.PoseLandmark.LEFT_HIP].y,
                lm[self.mp_pose.PoseLandmark.LEFT_HIP].z,
                lm[self.mp_pose.PoseLandmark.LEFT_HIP].visibility,
            ),
            "left_knee": Landmark(
                lm[self.mp_pose.PoseLandmark.LEFT_KNEE].x,
                lm[self.mp_pose.PoseLandmark.LEFT_KNEE].y,
                lm[self.mp_pose.PoseLandmark.LEFT_KNEE].z,
                lm[self.mp_pose.PoseLandmark.LEFT_KNEE].visibility,
            ),
            "left_ankle": Landmark(
                lm[self.mp_pose.PoseLandmark.LEFT_ANKLE].x,
                lm[self.mp_pose.PoseLandmark.LEFT_ANKLE].y,
                lm[self.mp_pose.PoseLandmark.LEFT_ANKLE].z,
                lm[self.mp_pose.PoseLandmark.LEFT_ANKLE].visibility,
            ),
            "left_shoulder": Landmark(
                lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].y,
                lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].z,
                lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].visibility,
            ),
            "left_elbow": Landmark(
                lm[self.mp_pose.PoseLandmark.LEFT_ELBOW].x,
                lm[self.mp_pose.PoseLandmark.LEFT_ELBOW].y,
                lm[self.mp_pose.PoseLandmark.LEFT_ELBOW].z,
                lm[self.mp_pose.PoseLandmark.LEFT_ELBOW].visibility,
            ),
        }
