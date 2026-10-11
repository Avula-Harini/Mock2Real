from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from backend.database import supabase
#from backend.member3.ai_routes import router as ai_router
from backend.speech_to_text import transcribe_audio
import os
import tempfile
import soundfile as sf

from backend.audio_analysis import (
    detect_filler_words,
    calculate_speaking_speed,
    detect_long_pauses,
    detect_hesitation,
    analyze_speech_fluency,
    analyze_voice_clarity,
    generate_speech_feedback
)


app = FastAPI(title="Mock2Real Backend")
#app.include_router(ai_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.56.84.79:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary storage for testing
interviews = {}

@app.get("/")
def home():
    return {
        "message": "Welcome to Mock2Real Backend!",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}


# Information received from the frontend
class InterviewRequest(BaseModel):
    role: str
    difficulty: str = "beginner"


# Start a new interview
@app.post("/start-interview")
def start_interview(request: InterviewRequest):

    session_id = str(uuid4())

    first_question = (
        f"Tell me about yourself and why "
        f"you are interested in the {request.role} role."
    )
    interview_data = {
        "session_id": session_id,
        "role": request.role,
        "difficulty": request.difficulty,
        "questions": [first_question],
        "answers": [],
        "status": "in_progress"
    }

    try:
        supabase.table("interviews").insert(interview_data).execute()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to save interview session"
        )

    interviews[session_id] = interview_data
    return {
        "session_id": session_id,
        "role": request.role,
        "difficulty": request.difficulty,
        "question": first_question
    }

from fastapi import HTTPException

class AnswerRequest(BaseModel):
    session_id: str
    answer: str


@app.post("/submit-answer")
def submit_answer(request: AnswerRequest):

    try:
        result = (
            supabase.table("interviews")
            .select("*")
            .eq("session_id", request.session_id)
            .limit(1)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve interview"
        )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    interview = result.data[0]

    if interview["status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="This interview is already completed"
        )
    interview["answers"].append(request.answer)

    answer_count = len(interview["answers"])

    next_question = (
        f"Can you explain more about your experience "
        f"related to {interview['role']}?"
    )

    interview["questions"].append(next_question)
    try:
        supabase.table("interviews").update({
            "answers": interview["answers"],
            "questions": interview["questions"]
        }).eq("session_id", request.session_id).execute()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to save interview answer"
        )
    return {
        "session_id": request.session_id,
        "answer_saved": True,
        "answer_count": answer_count,
        "next_question": next_question
    }


@app.post("/finish-interview/{session_id}")
def finish_interview(session_id: str):
    try:
        result = (
            supabase.table("interviews")
            .select("*")
            .eq("session_id", session_id)
            .limit(1)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve interview"
        )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    interview = result.data[0]

    if interview["status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="This interview is already completed"
        )
    answers = interview["answers"]

    if not answers:
        raise HTTPException(
            status_code=400,
            detail="Submit at least one answer before finishing"
        )

    # Basic demonstration metrics
    word_counts = [
        len(answer.split()) for answer in answers
    ]

    average_words = round(
        sum(word_counts) / len(word_counts), 1
    )

    filler_words = ["um", "uh", "like"]
    import re

    filler_count = sum(
        len(re.findall(
            r"\b" + word + r"\b",
            answer.lower()
        ))
        for answer in answers
        for word in filler_words
    )

    report = {
        "session_id": session_id,
        "role": interview["role"],
        "status": "completed",
        "total_answers": len(answers),
        "average_answer_words": average_words,
        "filler_word_count": filler_count,
        "feedback": (
            "Good start! Try adding specific examples "
            "and explaining your experience clearly."
        )
    }

    interview["status"] = "completed"
    interview["report"] = report
    try:
        supabase.table("interviews").update({
            "status": "completed",
            "report": report
        }).eq("session_id", session_id).execute()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to save interview report"
        )
    return report



@app.post("/api/audio/analyze")
async def analyze_audio_api(
    audio: UploadFile = File(...),
    transcript: str = Form(""),
    session_id: str = Form(...)
):

    if not audio.filename or not audio.filename.lower().endswith(".wav"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a WAV audio file"
        )

    audio_bytes = await audio.read()

    if not audio_bytes or len(audio_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Audio must be between 1 byte and 10 MB"
        )

    temp_path = None
    
    try:
        result = (
            supabase.table("interviews")
            .select("session_id")
            .eq("session_id", session_id)
            .limit(1)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to verify interview session"
        )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )



    try:
        with tempfile.NamedTemporaryFile(
            suffix=".wav", delete=False
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        try:
            audio_data, sample_rate = sf.read(temp_path)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid or unsupported WAV recording"
            )

        if sample_rate <= 0 or len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Audio recording is empty or invalid"
            )

        duration_seconds = len(audio_data) / sample_rate

        
       
        try:
            transcription = transcribe_audio(temp_path)
            transcript = transcription["transcript"]
       
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Transcription error: {type(e).__name__}: {e}"
            )




        if not transcript.strip():
            raise HTTPException(
                status_code=422,
                detail="No speech could be transcribed from the recording"
            )

        audio_results = {
            "transcript": transcript,
            "transcription_language": transcription["language"], 
            "duration_seconds": round(duration_seconds, 2),
            "filler_words": detect_filler_words(transcript),
            "speaking_speed": calculate_speaking_speed(
                transcript, duration_seconds
            ),
            "long_pauses": detect_long_pauses(temp_path),
            "hesitation": detect_hesitation(transcript, temp_path),
            "fluency": analyze_speech_fluency(
                transcript, temp_path, duration_seconds
            ),
            "voice": analyze_voice_clarity(temp_path),
            "coaching": generate_speech_feedback(
                transcript, temp_path, duration_seconds
            )
        }

        existing = (
            supabase.table("interviews")
            .select("report")
            .eq("session_id", session_id)
            .single()
            .execute()
        )

        report = existing.data.get("report") or {}
        report["audio_analysis"] = audio_results

        try:
            supabase.table("interviews").update({
                "report": report
            }).eq("session_id", session_id).execute()

        except Exception:
            raise HTTPException(
                status_code=503,
                detail="Unable to save audio analysis"
            )

        return audio_results

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

class TranscriptCorrection(BaseModel):
    session_id: str
    corrected_transcript: str


@app.post("/api/audio/correct-transcript")
def correct_transcript(data: TranscriptCorrection):
    corrected = data.corrected_transcript.strip()

    if not corrected:
        raise HTTPException(
            status_code=400,
            detail="Corrected transcript cannot be empty"
        )

    try:
        result = (
            supabase.table("interviews")
            .select("report")
            .eq("session_id", data.session_id)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found"
            )

        report = result.data[0].get("report") or {}
        audio_analysis = report.get("audio_analysis")

        if not isinstance(audio_analysis, dict):
            raise HTTPException(
                status_code=400,
                detail="Analyze audio before correcting transcript"
            )

        original = audio_analysis.get(
            "original_transcript",
            audio_analysis.get("transcript", "")
        )
        audio_analysis["original_transcript"] = original
        audio_analysis["corrected_transcript"] = corrected
        audio_analysis["transcript"] = corrected
        audio_analysis["transcript_reviewed"] = True
        audio_analysis["feedback_needs_refresh"] = True

        duration = audio_analysis.get("duration_seconds")

        if duration and duration > 0:
            audio_analysis["speaking_speed"] = calculate_speaking_speed(
                corrected, duration
            )

        audio_analysis["filler_words"] = detect_filler_words(corrected)
        updated_speed = audio_analysis.get("speaking_speed", {})
        wpm = updated_speed.get("words_per_minute")

        if wpm is not None:
            if isinstance(audio_analysis.get("fluency"), dict):
                audio_analysis["fluency"]["words_per_minute"] = wpm

            if isinstance(audio_analysis.get("coaching"), dict):
                audio_analysis["coaching"]["speaking_speed_wpm"] = wpm
      
        report["audio_analysis"] = audio_analysis

        supabase.table("interviews").update(
            {"report": report}
        ).eq("session_id", data.session_id).execute()

        return {
            "message": "Corrected transcript saved",
            "original_transcript": original,
            "corrected_transcript": corrected,
            "transcript_reviewed": True
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to save corrected transcript"
        )
