
import cv2
from pathlib import Path
from ultralytics import YOLO


# ==========================================
# MOCK2REAL - YOLO PERSON DETECTION
# ==========================================

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "yolo11n.pt"


def start_person_detection():
    print("Loading YOLO person detection model...")

    # Downloads the lightweight model on first use,
    # then saves a copy in the models folder.
    if MODEL_PATH.exists():
        model = YOLO(str(MODEL_PATH))
    else:
        model = YOLO("yolo11n.pt")
        model.save(str(MODEL_PATH))

    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        camera.release()
        camera = cv2.VideoCapture(0, cv2.CAP_MSMF)

    if not camera.isOpened():
        print("ERROR: Could not open webcam.")
        return

    print("Mock2Real YOLO Person Detection Started!")
    print("Press Q to close the camera.")

    try:
        while True:
            success, frame = camera.read()

            if not success or frame is None:
                print("ERROR: Could not read camera frame.")
                break

            frame = cv2.flip(frame, 1)

            results = model.predict(
                source=frame,
                classes=[0],      # COCO class 0 = person
                conf=0.4,
                verbose=False
            )

            person_count = 0

            for result in results:
                for box in result.boxes:
                    person_count += 1

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0].tolist()
                    )

                    confidence = float(box.conf[0])

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"Person {person_count}: {confidence:.2f}",
                        (x1, max(25, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2
                    )

            cv2.putText(
                frame,
                f"People detected: {person_count}",
                (15, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )

            cv2.imshow(
                "Mock2Real - YOLO Person Detection",
                frame
            )

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("YOLO detection stopped.")


if __name__ == "__main__":
    start_person_detection()
