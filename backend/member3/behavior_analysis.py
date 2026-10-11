
import math


# ==========================================
# MOCK2REAL - BEHAVIOR ANALYSIS
# ==========================================

def analyze_head_direction(face_landmarks):
    """
    Estimate horizontal head orientation
    from nose and cheek landmark positions.

    This is a rough 2D estimate, not
    calibrated gaze or head pose tracking.
    """

    if not face_landmarks:
        return {
            "head_direction": "Not detected",
            "face_center_ratio": None
        }

    # MediaPipe Face Landmarker indices
    nose = face_landmarks[1]
    cheek_a = face_landmarks[234]
    cheek_b = face_landmarks[454]

    left_x = min(cheek_a.x, cheek_b.x)
    right_x = max(cheek_a.x, cheek_b.x)

    face_width = right_x - left_x

    if face_width < 0.01:
        return {
            "head_direction": "Uncertain",
            "face_center_ratio": None
        }

    # Nose position relative to face width
    ratio = (nose.x - left_x) / face_width

    if 0.35 <= ratio <= 0.65:
        direction = "Approximately centered"
    else:
        direction = "Turned sideways"

    return {
        "head_direction": direction,
        "face_center_ratio": round(ratio, 3)
    }


def analyze_posture(pose_landmarks):
    """
    Measure shoulder alignment using
    MediaPipe Pose landmarks 11 and 12.
    """

    if not pose_landmarks:
        return {
            "shoulder_alignment": "Not detected",
            "shoulder_tilt_degrees": None
        }

    left_shoulder = pose_landmarks[11]
    right_shoulder = pose_landmarks[12]

    if (
        left_shoulder.visibility < 0.5
        or right_shoulder.visibility < 0.5
    ):
        return {
            "shoulder_alignment": "Uncertain",
            "shoulder_tilt_degrees": None
        }

    dx = right_shoulder.x - left_shoulder.x
    dy = right_shoulder.y - left_shoulder.y

    # Normalized coordinates give only
    # an approximate screen-space angle.
    if abs(dx) < 0.01:
        return {
            "shoulder_alignment": "Uncertain",
            "shoulder_tilt_degrees": None
        }

    angle = math.degrees(
        math.atan2(abs(dy), abs(dx))
    )

    if angle <= 8:
        alignment = "Approximately level"
    else:
        alignment = "Shoulders tilted"

    return {
        "shoulder_alignment": alignment,
        "shoulder_tilt_degrees": round(angle, 1)
    }


def analyze_frame(face_landmarks, pose_landmarks):
    """
    Combine head and shoulder observations.
    """

    head_result = analyze_head_direction(
        face_landmarks
    )

    posture_result = analyze_posture(
        pose_landmarks
    )

    return {
        **head_result,
        **posture_result
    }
