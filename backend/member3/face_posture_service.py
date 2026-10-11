
import time
from pathlib import Path

import cv2
import mediapipe as mp

from .behavior_analysis import analyze_frame


# ==========================================
# MOCK2REAL - MEDIAPIPE CAMERA ANALYSIS
# ==========================================

MODEL_DIR = Path(__file__).resolve().parent / "models"

FACE_MODEL = MODEL_DIR / "face_landmarker.task"
POSE_MODEL = MODEL_DIR / "pose_landmarker_lite.task"


# ==========================================
# DRAW FACE LANDMARKS
# ==========================================

def draw_face_landmarks(frame, landmarks):
    height, width = frame.shape[:2]

    # Draw every fourth facial landmark
    for landmark in landmarks[::4]:
        x = int(landmark.x * width)
        y = int(landmark.y * height)

        if 0 <= x < width and 0 <= y < height:
            cv2.circle(
                frame,
                (x, y),
                1,
                (0, 255, 0),
                -1
            )


# ==========================================
# DRAW UPPER-BODY POSTURE
# ==========================================

def draw_pose_landmarks(frame, landmarks):
    height, width = frame.shape[:2]

    connections = [
        (11, 12),  # Shoulders
        (11, 13),  # Left upper arm
        (13, 15),  # Left forearm
        (12, 14),  # Right upper arm
        (14, 16),  # Right forearm
        (11, 23),  # Left torso
        (12, 24),  # Right torso
        (23, 24),  # Hips
    ]

    def get_point(index):
        landmark = landmarks[index]

        if landmark.visibility < 0.5:
            return None

        x = int(landmark.x * width)
        y = int(landmark.y * height)

        if not (0 <= x < width and 0 <= y < height):
            return None

        return (x, y)

    # Draw body connections
    for start, end in connections:
        p1 = get_point(start)
        p2 = get_point(end)

        if p1 is not None and p2 is not None:
            cv2.line(
                frame,
                p1,
                p2,
                (255, 100, 0),
                3
            )

    # Draw joint points
    for index in [11, 12, 13, 14, 15, 16, 23, 24]:
        point = get_point(index)

        if point is not None:
            cv2.circle(
                frame,
                point,
                5,
                (0, 255, 255),
                -1
            )


# ==========================================
# DRAW TEXT ON CAMERA
# ==========================================

def draw_text(frame, label, y, color=(255, 255, 255)):
    cv2.putText(
        frame,
        label,
        (15, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        color,
        2,
        cv2.LINE_AA
    )


# ==========================================
# START LIVE FACE + POSTURE DETECTION
# ==========================================

def start_detection():

    if not FACE_MODEL.is_file():
        print("ERROR: Face Landmarker model is missing.")
        print("Expected:", FACE_MODEL)
        return

    if not POSE_MODEL.is_file():
        print("ERROR: Pose Landmarker model is missing.")
        print("Expected:", POSE_MODEL)
        return

    BaseOptions = mp.tasks.BaseOptions
    Vision = mp.tasks.vision

    # Configure face landmarker
    face_options = Vision.FaceLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=str(FACE_MODEL)
        ),
        running_mode=Vision.RunningMode.VIDEO,
        num_faces=1
    )

    # Configure pose landmarker
    pose_options = Vision.PoseLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=str(POSE_MODEL)
        ),
        running_mode=Vision.RunningMode.VIDEO,
        num_poses=1
    )

    # Open webcam
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        camera.release()
        camera = cv2.VideoCapture(0, cv2.CAP_MSMF)

    if not camera.isOpened():
        print("ERROR: Could not open webcam.")
        return

    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("===================================")
    print("Mock2Real AI Camera Analysis")
    print("===================================")
    print("Face detection: Enabled")
    print("Posture detection: Enabled")
    print("Head direction: Enabled")
    print("Shoulder alignment: Enabled")
    print("Press Q to stop.")
    print("===================================")

    start_time = time.monotonic()

    try:
        with (
            Vision.FaceLandmarker.create_from_options(
                face_options
            ) as face_detector,
            Vision.PoseLandmarker.create_from_options(
                pose_options
            ) as pose_detector
        ):

            while True:

                success, frame = camera.read()

                if not success or frame is None:
                    print("ERROR: Could not read camera frame.")
                    break

                # Mirror camera image
                frame = cv2.flip(frame, 1)

                # Convert OpenCV BGR to MediaPipe RGB
                rgb_frame = cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2RGB
                )

                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=rgb_frame
                )

                timestamp_ms = int(
                    (time.monotonic() - start_time) * 1000
                )

                # Run MediaPipe detections
                face_result = face_detector.detect_for_video(
                    mp_image,
                    timestamp_ms
                )

                pose_result = pose_detector.detect_for_video(
                    mp_image,
                    timestamp_ms
                )

                face_detected = bool(
                    face_result.face_landmarks
                )

                pose_detected = bool(
                    pose_result.pose_landmarks
                )

                face_points = (
                    face_result.face_landmarks[0]
                    if face_detected
                    else None
                )

                pose_points = (
                    pose_result.pose_landmarks[0]
                    if pose_detected
                    else None
                )

                # Analyze head direction and posture
                observations = analyze_frame(
                    face_points,
                    pose_points
                )

                # Draw facial landmark points
                if face_detected:
                    draw_face_landmarks(
                        frame,
                        face_points
                    )

                # Draw posture connections
                if pose_detected:
                    draw_pose_landmarks(
                        frame,
                        pose_points
                    )

                # ==================================
                # LIVE CAMERA INFORMATION
                # ==================================

                draw_text(
                    frame,
                    "Face: Detected"
                    if face_detected
                    else "Face: Not detected",
                    30,
                    (0, 255, 0)
                    if face_detected
                    else (0, 0, 255)
                )

                draw_text(
                    frame,
                    "Posture: Detected"
                    if pose_detected
                    else "Posture: Not detected",
                    60,
                    (0, 255, 0)
                    if pose_detected
                    else (0, 0, 255)
                )

                draw_text(
                    frame,
                    "Head: "
                    + observations["head_direction"],
                    90
                )

                draw_text(
                    frame,
                    "Shoulders: "
                    + observations["shoulder_alignment"],
                    120
                )

                tilt = observations[
                    "shoulder_tilt_degrees"
                ]

                if tilt is not None:
                    draw_text(
                        frame,
                        f"Shoulder tilt: {tilt:.1f} deg",
                        150
                    )

                # Show live camera window
                cv2.imshow(
                    "Mock2Real - Face and Posture Analysis",
                    frame
                )

                # Press Q to exit
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("Camera released successfully.")
        print("Mock2Real analysis stopped.")


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":
    start_detection()
