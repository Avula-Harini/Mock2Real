
from collections import Counter


def generate_interview_report(
    evaluations: list,
    camera_statistics: dict | None = None
) -> dict:

    if not evaluations:
        raise ValueError(
            "At least one evaluation is required."
        )

    score_fields = [
        "technical_score",
        "relevance_score",
        "completeness_score",
        "clarity_score"
    ]

    for evaluation in evaluations:
        if not isinstance(evaluation, dict):
            raise ValueError("Invalid evaluation.")

        for field in score_fields:
            value = evaluation.get(field)

            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not 0 <= value <= 10
            ):
                raise ValueError(
                    f"Invalid or missing score: {field}"
                )

        for field in ["strengths", "improvements"]:
            values = evaluation.get(field)

            if (
                not isinstance(values, list)
                or not all(
                    isinstance(item, str)
                    for item in values
                )
            ):
                raise ValueError(
                    f"Invalid field: {field}"
                )

    averages = {
        field: round(
            sum(item[field] for item in evaluations)
            / len(evaluations),
            1
        )
        for field in score_fields
    }

    overall_score = round(
        sum(
            item[field]
            for item in evaluations
            for field in score_fields
        ) / (len(evaluations) * len(score_fields)),
        1
    )

    strengths = [
        text.strip()
        for evaluation in evaluations
        for text in evaluation["strengths"]
        if text.strip()
    ]

    improvements = [
        text.strip()
        for evaluation in evaluations
        for text in evaluation["improvements"]
        if text.strip()
    ]

    if overall_score >= 8:
        summary = (
            "Strong technical interview practice. "
            "Continue refining practical examples."
        )
    elif overall_score >= 6:
        summary = (
            "Good foundational understanding. "
            "Practice giving detailed examples."
        )
    else:
        summary = (
            "Further practice is recommended. "
            "Review core concepts and improve answer detail."
        )

    # Camera statistics stay separate
    # from technical answer scores.
    if camera_statistics is not None:
        if not isinstance(camera_statistics, dict):
            raise ValueError(
                "Camera statistics must be a JSON object."
            )

        required_camera_fields = [
            "duration_seconds",
            "total_frames_analyzed",
            "face_detection_percentage",
            "pose_detection_percentage",
            "single_person_percentage",
            "multiple_person_percentage",
            "no_person_percentage",
            "head_centered_percentage",
            "shoulders_level_percentage",
            "average_shoulder_tilt_degrees",
            "valid_head_frames",
            "valid_shoulder_frames"
        ]

        missing = [
            field for field in required_camera_fields
            if field not in camera_statistics
        ]

        if missing:
            raise ValueError(
                "Missing camera statistics: "
                + ", ".join(missing)
            )

        percentage_fields = [
            "face_detection_percentage",
            "pose_detection_percentage",
            "single_person_percentage",
            "multiple_person_percentage",
            "no_person_percentage",
            "head_centered_percentage",
            "shoulders_level_percentage"
        ]

        for field in percentage_fields:
            value = camera_statistics[field]

            if value is None and field in [
                "head_centered_percentage",
                "shoulders_level_percentage"
            ]:
                continue

            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not 0 <= value <= 100
            ):
                raise ValueError(
                    f"Invalid camera percentage: {field}"
                )

        if (
            camera_statistics["duration_seconds"] < 0
            or camera_statistics["total_frames_analyzed"] < 0
        ):
            raise ValueError(
                "Invalid camera duration or frame count."
            )

        camera_summary = (
            "Camera observations describe frame visibility "
            "and approximate head/shoulder geometry. "
            "They are not measures of confidence, "
            "eye contact, or interview competence."
        )

    else:
        camera_summary = None

    return {
        "total_questions": len(evaluations),
        "overall_score": overall_score,
        "average_scores": averages,
        "strengths": [
            item for item, _ in
            Counter(strengths).most_common(5)
        ],
        "improvements": [
            item for item, _ in
            Counter(improvements).most_common(5)
        ],
        "summary": summary,
        "question_evaluations": evaluations,
        "camera_statistics": camera_statistics,
        "camera_summary": camera_summary
    }
