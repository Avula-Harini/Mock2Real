
import json
import time
from datetime import datetime
from pathlib import Path

import cv2
import mediapipe as mp
from ultralytics import YOLO

from .behavior_analysis import analyze_frame
from .camera_statistics import CameraSessionStatistics
from .face_posture_service import (
    draw_face_landmarks,
    draw_pose_landmarks,
    draw_text
)


# ==========================================
# MOCK2REAL - COMBINED CAMERA ANALYSIS
# YOLO + MEDIAPIPE + SESSION STATISTICS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"
REPORT_DIR = BASE_DIR / "reports"

FACE_MODEL = MODEL_DIR / "face_landmarker.task"
POSE_MODEL = MODEL_DIR / "pose_landmarker_lite.task"
YOLO_MODEL = MODEL_DIR / "yolo11n.pt"


# ==========================================
# YOLO SETTINGS
# ==========================================

PERSON_CONFIDENCE = 0.50
YOLO_IOU_THRESHOLD = 0.45

# Reject detected person boxes covering less
# than 8% of the full camera frame.
MIN_PERSON_AREA_RATIO = 0.08

DEBUG_YOLO = True
DEBUG_INTERVAL_SECONDS = 2.0


# ==========================================
# SAVE CAMERA SESSION REPORT
# ==========================================

def save_camera_report(report):
    REPORT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S_%f"
    )

    report_path = (
        REPORT_DIR / f"camera_report_{timestamp}.json"
    )

    with open(
        report_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            report,
            file,
            indent=4
        )

    print("\nCamera report saved successfully:")
    print(report_path)

    return report_path


# ==========================================
# OPEN WEBCAM
# ==========================================

def open_camera():
    for backend in [
        cv2.CAP_DSHOW,
        cv2.CAP_MSMF
    ]:
        camera = cv2.VideoCapture(
            0,
            backend
        )

        if camera.isOpened():
            return camera

        camera.release()

    return None


# ==========================================
# FILTER YOLO PERSON DETECTIONS
# ==========================================

def filter_person_boxes(
    yolo_results,
    frame_width,
    frame_height
):
    detected_boxes = []

    frame_area = frame_width * frame_height

    if frame_area <= 0:
        return detected_boxes

    for result in yolo_results:
        for box in result.boxes:

            confidence = float(box.conf[0])

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )

            # Keep coordinates inside the image
            x1 = max(0, min(x1, frame_width))
            x2 = max(0, min(x2, frame_width))
            y1 = max(0, min(y1, frame_height))
            y2 = max(0, min(y2, frame_height))

            box_width = max(0, x2 - x1)
            box_height = max(0, y2 - y1)

            box_area = box_width * box_height
            area_ratio = box_area / frame_area

            # Ignore tiny person detections
            if area_ratio < MIN_PERSON_AREA_RATIO:
                continue

            detected_boxes.append(
                (
                    x1,
                    y1,
                    x2,
                    y2,
                    confidence
                )
            )

    return detected_boxes


# ==========================================
# RUN COMBINED CAMERA ANALYSIS
# ==========================================

def start_combined_detection():

    # Verify MediaPipe model files
    for model_path in [
        FACE_MODEL,
        POSE_MODEL
    ]:
        if not model_path.is_file():
            print(
                "ERROR: Missing model:",
                model_path
            )
            return

    print("Loading Mock2Real AI models...")

    # Load YOLO model
    if YOLO_MODEL.is_file():
        yolo = YOLO(str(YOLO_MODEL))
    else:
        print("Using Ultralytics model cache/download.")
        yolo = YOLO("yolo11n.pt")

    BaseOptions = mp.tasks.BaseOptions
    Vision = mp.tasks.vision

    # Configure MediaPipe Face Landmarker
    face_options = Vision.FaceLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=str(FACE_MODEL)
        ),
        running_mode=Vision.RunningMode.VIDEO,
        num_faces=1
    )

    # Configure MediaPipe Pose Landmarker
    pose_options = Vision.PoseLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=str(POSE_MODEL)
        ),
        running_mode=Vision.RunningMode.VIDEO,
        num_poses=1
    )

    # Start webcam
    camera = open_camera()

    if camera is None:
        print("ERROR: Unable to access webcam.")
        print("Close other camera applications.")
        return

    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        640
    )
    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        480
    )

    # Start fresh camera session statistics
    statistics = CameraSessionStatistics()

    start_time = time.monotonic()
    last_timestamp_ms = -1
    last_debug_time = start_time

    print("\n===================================")
    print("Mock2Real Combined Camera Analysis")
    print("===================================")
    print("YOLO person detection: ON")
    print("Small-box filtering: ON")
    print("MediaPipe face detection: ON")
    print("MediaPipe pose detection: ON")
    print("Head direction: ON")
    print("Shoulder alignment: ON")
    print("Camera session statistics: ON")
    print("YOLO debugging: ON")
    print("Press Q to stop and save report")
    print("===================================\n")

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

                # Mirror webcam image
                frame = cv2.flip(frame, 1)

                height, width = frame.shape[:2]

                # ==================================
                # 1. MEDIAPIPE ANALYSIS
                # ==================================

                rgb_frame = cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2RGB
                )

                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=rgb_frame
                )

                timestamp_ms = max(
                    int(
                        (time.monotonic() - start_time)
                        * 1000
                    ),
                    last_timestamp_ms + 1
                )

                last_timestamp_ms = timestamp_ms

                face_result = (
                    face_detector.detect_for_video(
                        mp_image,
                        timestamp_ms
                    )
                )

                pose_result = (
                    pose_detector.detect_for_video(
                        mp_image,
                        timestamp_ms
                    )
                )

                face_points = (
                    face_result.face_landmarks[0]
                    if face_result.face_landmarks
                    else None
                )

                pose_points = (
                    pose_result.pose_landmarks[0]
                    if pose_result.pose_landmarks
                    else None
                )

                # ==================================
                # 2. YOLO PERSON DETECTION
                # ==================================

                yolo_results = yolo.predict(
                    source=frame,
                    classes=[0],
                    conf=PERSON_CONFIDENCE,
                    iou=YOLO_IOU_THRESHOLD,
                    verbose=False
                )

                # Filter small person boxes
                detected_boxes = filter_person_boxes(
                    yolo_results,
                    width,
                    height
                )

                person_count = len(detected_boxes)

                # ==================================
                # 3. YOLO DEBUGGING
                # ==================================

                now = time.monotonic()

                if (
                    DEBUG_YOLO
                    and now - last_debug_time
                    >= DEBUG_INTERVAL_SECONDS
                ):
                    raw_count = sum(
                        len(result.boxes)
                        for result in yolo_results
                    )

                    print(
                        f"[YOLO DEBUG] "
                        f"Raw boxes: {raw_count} | "
                        f"Filtered people: {person_count}"
                    )

                    for index, box in enumerate(
                        detected_boxes,
                        start=1
                    ):
                        x1, y1, x2, y2, confidence = box

                        print(
                            f"  Person {index}: "
                            f"({x1}, {y1}, {x2}, {y2}) "
                            f"confidence={confidence:.2f}"
                        )

                    last_debug_time = now

                # ==================================
                # 4. DRAW YOLO PERSON BOXES
                # ==================================

                for index, box in enumerate(
                    detected_boxes,
                    start=1
                ):
                    x1, y1, x2, y2, confidence = box

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"Person {index}: {confidence:.2f}",
                        (x1, max(25, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 255, 0),
                        2
                    )

                # ==================================
                # 5. HEAD + SHOULDER OBSERVATIONS
                # ==================================

                observations = analyze_frame(
                    face_points,
                    pose_points
                )

                # ==================================
                # 6. COLLECT SESSION STATISTICS
                # ==================================

                statistics.update(
                    person_count=person_count,
                    face_detected=face_points is not None,
                    pose_detected=pose_points is not None,
                    observations=observations
                )

                # ==================================
                # 7. DRAW MEDIAPIPE LANDMARKS
                # ==================================

                if face_points is not None:
                    draw_face_landmarks(
                        frame,
                        face_points
                    )

                if pose_points is not None:
                    draw_pose_landmarks(
                        frame,
                        pose_points
                    )

                # ==================================
                # 8. LIVE CAMERA INFORMATION
                # ==================================

                draw_text(
                    frame,
                    f"People: {person_count}",
                    30
                )

                draw_text(
                    frame,
                    "Face: Detected"
                    if face_points is not None
                    else "Face: Not detected",
                    60
                )

                draw_text(
                    frame,
                    "Pose: Detected"
                    if pose_points is not None
                    else "Pose: Not detected",
                    90
                )

                draw_text(
                    frame,
                    "Head: "
                    + observations["head_direction"],
                    120
                )

                draw_text(
                    frame,
                    "Shoulders: "
                    + observations["shoulder_alignment"],
                    150
                )

                tilt = observations[
                    "shoulder_tilt_degrees"
                ]

                if tilt is not None:
                    draw_text(
                        frame,
                        f"Shoulder tilt: {tilt:.1f} deg",
                        180
                    )

                draw_text(
                    frame,
                    f"Frames: {statistics.total_frames}",
                    210
                )

                # Display live webcam
                cv2.imshow(
                    "Mock2Real - Combined AI Camera",
                    frame
                )

                # Stop and generate report
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("User ended camera session.")
                    break

    finally:

        # Release webcam
        camera.release()
        cv2.destroyAllWindows()

        # Generate session report
        report = statistics.get_report()

        print("\n===================================")
        print("Mock2Real Camera Session Report")
        print("===================================")

        print(json.dumps(report, indent=4))

        try:
            save_camera_report(report)
        except OSError as error:
            print(
                "ERROR saving report:",
                error
            )

        print("===================================")
        print("Camera analysis stopped.")


if __name__ == "__main__":
    start_combined_detection()
