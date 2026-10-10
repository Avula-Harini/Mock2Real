
from functools import lru_cache

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_whisper_model():
    return WhisperModel(
        "small",
        device="cpu",
        compute_type="int8"
    )


def transcribe_audio(audio_path: str):
    audio, sample_rate = sf.read(
        audio_path,
        dtype="float32"
    )

    if sample_rate != 16000:
        raise ValueError(
            "Audio must have a 16000 Hz sample rate"
        )

    if audio.ndim == 2:
        audio = audio.mean(axis=1)

    audio = np.asarray(audio, dtype=np.float32)

    model = get_whisper_model()

    segments, info = model.transcribe(
        audio,
        language="en",
        beam_size=5,
        vad_filter=True,
        condition_on_previous_text=False,
        hallucination_silence_threshold=2.0
    )

    transcript = " ".join(
        segment.text.strip() for segment in segments
    ).strip()

    return {
        "transcript": transcript,
        "language": info.language,
        "language_probability": round(
            info.language_probability, 3
        )
    }



