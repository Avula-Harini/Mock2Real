
import time


class CameraSessionStatistics:

    def __init__(self):
        self.start_time = time.monotonic()

        self.total_frames = 0
        self.face_detected_frames = 0
        self.pose_detected_frames = 0

        self.head_centered_frames = 0
        self.head_valid_frames = 0

        self.shoulders_level_frames = 0
        self.shoulder_valid_frames = 0

        self.single_person_frames = 0
        self.multiple_person_frames = 0
        self.no_person_frames = 0

        self.shoulder_tilt_sum = 0.0

    def update(
        self,
        person_count,
        face_detected,
        pose_detected,
        observations
    ):
        self.total_frames += 1

        # Count people detected
        if person_count == 0:
            self.no_person_frames += 1
        elif person_count == 1:
            self.single_person_frames += 1
        else:
            self.multiple_person_frames += 1

        # Count face and pose detections
        if face_detected:
            self.face_detected_frames += 1

        if pose_detected:
            self.pose_detected_frames += 1

        # Record head direction
        head_direction = observations.get(
            "head_direction"
        )

        if head_direction in [
            "Approximately centered",
            "Turned sideways"
        ]:
            self.head_valid_frames += 1

            if head_direction == "Approximately centered":
                self.head_centered_frames += 1

        # Record shoulder measurements
        alignment = observations.get(
            "shoulder_alignment"
        )

        tilt = observations.get(
            "shoulder_tilt_degrees"
        )

        if tilt is not None:
            self.shoulder_valid_frames += 1
            self.shoulder_tilt_sum += tilt

            if alignment == "Approximately level":
                self.shoulders_level_frames += 1

    @staticmethod
    def percentage(count, total):
        if total == 0:
            return 0.0

        return round(count / total * 100, 1)

    def get_report(self):
        duration = round(
            time.monotonic() - self.start_time,
            1
        )

        average_tilt = None

        if self.shoulder_valid_frames > 0:
            average_tilt = round(
                self.shoulder_tilt_sum
                / self.shoulder_valid_frames,
                1
            )

        return {
            "duration_seconds": duration,
            "total_frames_analyzed": self.total_frames,

            "face_detection_percentage": self.percentage(
                self.face_detected_frames,
                self.total_frames
            ),

            "pose_detection_percentage": self.percentage(
                self.pose_detected_frames,
                self.total_frames
            ),

            "single_person_percentage": self.percentage(
                self.single_person_frames,
                self.total_frames
            ),

            "multiple_person_percentage": self.percentage(
                self.multiple_person_frames,
                self.total_frames
            ),

            "no_person_percentage": self.percentage(
                self.no_person_frames,
                self.total_frames
            ),

            "head_centered_percentage": (
                self.percentage(
                    self.head_centered_frames,
                    self.head_valid_frames
                )
                if self.head_valid_frames
                else None
            ),

            "shoulders_level_percentage": (
                self.percentage(
                    self.shoulders_level_frames,
                    self.shoulder_valid_frames
                )
                if self.shoulder_valid_frames
                else None
            ),

            "average_shoulder_tilt_degrees": average_tilt,
            "valid_head_frames": self.head_valid_frames,
            "valid_shoulder_frames": self.shoulder_valid_frames
        }
