
import cv2


def test_camera():
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("ERROR: Camera could not be opened.")
        print("Check Windows camera permissions and close other camera apps.")
        return

    print("SUCCESS: Camera opened!")
    print("Press Q in the camera window to stop.")

    try:
        while True:
            success, frame = camera.read()

            if not success:
                print("ERROR: Could not read camera frame.")
                break

            cv2.putText(
                frame,
                "Mock2Real - Camera Test",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

            cv2.imshow("Mock2Real Camera Test", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("Camera closed successfully.")


if __name__ == "__main__":
    test_camera()
