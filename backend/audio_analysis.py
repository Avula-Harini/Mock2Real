
import re
from collections import Counter
import numpy as np
import soundfile as sf

def detect_filler_words(transcript: str):
    """Count common filler words in an interview transcript."""

    filler_words = ["um", "uh", "hmm", "ah"]

    words = re.findall(r"\b[\w']+\b", transcript.lower())

    counts = Counter(
        word for word in words if word in filler_words
    )

    return {
        "total_filler_words": sum(counts.values()),
        "filler_word_counts": {
            word: counts.get(word, 0)
            for word in filler_words
        }
    }



def calculate_speaking_speed(transcript: str, duration_seconds: float):
    """Calculate speaking speed in words per minute."""

    if duration_seconds <= 0:
        return {
            "word_count": 0,
            "duration_seconds": duration_seconds,
            "words_per_minute": 0,
            "feedback": "Invalid recording duration"
        }

    words = re.findall(r"\b[\w']+\b", transcript)
    word_count = len(words)

    words_per_minute = round(
        (word_count / duration_seconds) * 60, 2
    )

    if words_per_minute < 100:
        feedback = "Slow speaking pace"
    elif words_per_minute <= 160:
        feedback = "Moderate speaking pace"
    else:
        feedback = "Fast speaking pace"

    return {
        "word_count": word_count,
        "duration_seconds": duration_seconds,
        "words_per_minute": words_per_minute,
        "feedback": "No long pauses detected"

    }



def detect_long_pauses(audio_path: str, min_pause_seconds: float = 2.0):
    """Detect long low-volume pauses in a WAV audio file."""

    audio, sample_rate = sf.read(audio_path)

    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    chunk_size = max(1, int(sample_rate * 0.1))
    threshold = 0.02

    pauses = []
    silence_start = None

    for start in range(0, len(audio), chunk_size):
        chunk = audio[start:start + chunk_size]
        rms = np.sqrt(np.mean(chunk ** 2))
        current_time = start / sample_rate

        if rms < threshold:
            if silence_start is None:
                silence_start = current_time
        elif silence_start is not None:
            duration = current_time - silence_start

            if duration >= min_pause_seconds:
                pauses.append({
                    "start": round(silence_start, 2),
                    "end": round(current_time, 2),
                    "duration": round(duration, 2)
                })

            silence_start = None

    if silence_start is not None:
        end_time = len(audio) / sample_rate
        duration = end_time - silence_start

        if duration >= min_pause_seconds:
            pauses.append({
                "start": round(silence_start, 2),
                "end": round(end_time, 2),
                "duration": round(duration, 2)
            })

    return {
        "long_pause_count": len(pauses),
        "pauses": pauses,
        "total_pause_duration": round(
            sum(p["duration"] for p in pauses), 2
        )
    }



def detect_hesitation(transcript: str, audio_path: str):
    """Estimate hesitation indicators from fillers and pauses."""

    filler_result = detect_filler_words(transcript)
    pause_result = detect_long_pauses(audio_path)

    filler_count = filler_result["total_filler_words"]
    pause_count = pause_result["long_pause_count"]

    hesitation_count = filler_count + pause_count

    if hesitation_count == 0:
        feedback = "No major hesitation indicators detected"
    elif hesitation_count <= 3:
        feedback = "Some hesitation indicators detected"
    else:
        feedback = "Frequent hesitation indicators detected"

    return {
        "filler_word_count": filler_count,
        "long_pause_count": pause_count,
        "hesitation_indicator_count": hesitation_count,
        "feedback": feedback
    }



def analyze_speech_fluency(
    transcript: str,
    audio_path: str,
    duration_seconds: float
):
    """Analyze observable speech fluency indicators."""

    speed = calculate_speaking_speed(
        transcript, duration_seconds
    )
    hesitation = detect_hesitation(
        transcript, audio_path
    )

    wpm = speed["words_per_minute"]
    hesitation_count = hesitation["hesitation_indicator_count"]

    if wpm == 0:
        feedback = "No speech detected or invalid duration"
    elif 100 <= wpm <= 160 and hesitation_count <= 3:
        feedback = "Steady speaking pace with few hesitation indicators"
    elif hesitation_count > 3:
        feedback = "Try reducing filler words and long pauses"
    elif wpm < 100:
        feedback = "Try maintaining a more consistent speaking pace"
    else:
        feedback = "Try slowing down slightly for easier listening"

    return {
        "words_per_minute": wpm,
        "hesitation_indicator_count": hesitation_count,
        "fluency_feedback": feedback
    }



def analyze_voice_clarity(audio_path: str):
    """Analyze recording volume and potential clipping."""

    audio, sample_rate = sf.read(audio_path)

    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    if len(audio) == 0:
        return {"error": "Audio recording is empty"}

    rms_volume = float(np.sqrt(np.mean(audio ** 2)))
    peak_volume = float(np.max(np.abs(audio)))

    clipping_percentage = float(
        np.mean(np.abs(audio) >= 0.99) * 100
    )

    if rms_volume < 0.01:
        feedback = "Very low recording volume"
    elif clipping_percentage > 1:
        feedback = "Possible audio clipping detected"
    elif rms_volume > 0.5:
        feedback = "High recording volume"
    else:
        feedback = "Recording volume appears acceptable"

    return {
        "rms_volume": round(rms_volume, 4),
        "peak_volume": round(peak_volume, 4),
        "clipping_percentage": round(clipping_percentage, 2),
        "voice_feedback": feedback
    }



def generate_speech_feedback(
    transcript: str,
    audio_path: str,
    duration_seconds: float
):
    """Generate interview coaching feedback from speech indicators."""

    fluency = analyze_speech_fluency(
        transcript, audio_path, duration_seconds
    )

    voice = analyze_voice_clarity(audio_path)

    wpm = fluency["words_per_minute"]
    hesitation_count = fluency["hesitation_indicator_count"]

    suggestions = []

    if wpm < 100:
        suggestions.append(
            "Practice maintaining a steady speaking pace."
        )
    elif wpm > 160:
        suggestions.append(
            "Try slowing down slightly for easier listening."
        )

    if hesitation_count > 3:
        suggestions.append(
            "Practice reducing filler words and long pauses."
        )

    if voice.get("voice_feedback") != "Recording volume appears acceptable":
        suggestions.append(voice.get("voice_feedback", "Check audio quality."))

    if not suggestions:
        suggestions.append(
            "Your speech indicators look steady. Keep practicing!"
        )

    return {
        "speaking_speed_wpm": wpm,
        "hesitation_indicator_count": hesitation_count,
        "voice_feedback": voice.get("voice_feedback"),
        "coaching_suggestions": suggestions
    }







