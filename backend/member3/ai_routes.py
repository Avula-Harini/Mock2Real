
from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
    Query
)

from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from .ollama_service import (
    generate_question,
    generate_followup,
    generate_resume_question
)
from .resume_service import extract_resume_text
from .evaluation_service import evaluate_answer
from .report_service import generate_interview_report


router = APIRouter(
    prefix="/api/ai",
    tags=["Mock2Real AI"]
)


# ==========================================
# REQUEST MODELS
# ==========================================

class QuestionRequest(BaseModel):
    role: str = Field(min_length=1)
    level: str = "beginner"


class FollowupRequest(BaseModel):
    role: str = Field(min_length=1)
    previous_question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    level: str = "beginner"


class EvaluationRequest(BaseModel):
    role: str = Field(min_length=1)
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    level: str = "beginner"


class ReportRequest(BaseModel):
    evaluations: list[dict]
    camera_statistics: dict | None = None


# ==========================================
# 1. HEALTH CHECK
# ==========================================

@router.get("/health")
def health():
    return {
        "status": "success",
        "message": "Member 3 AI backend connected!"
    }


# ==========================================
# 2. RAG QUESTION GENERATION
# ==========================================

@router.post("/question")
async def question(data: QuestionRequest):
    try:
        result = await run_in_threadpool(
            generate_question,
            data.role,
            data.level
        )

        return {
            "role": data.role,
            "level": data.level,
            "question": result
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Question generation failed."
        )


# ==========================================
# 3. DYNAMIC FOLLOW-UP
# ==========================================

@router.post("/followup")
async def followup(data: FollowupRequest):
    try:
        result = await run_in_threadpool(
            generate_followup,
            data.role,
            data.previous_question,
            data.answer,
            data.level
        )

        return {
            "followup_question": result
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Follow-up generation failed."
        )


# ==========================================
# 4. RESUME QUESTION
# ==========================================

@router.post("/resume-question")
async def resume_question(
    file: UploadFile = File(...),
    role: str = Query(default="Python Developer"),
    level: str = Query(default="beginner")
):
    max_size = 5 * 1024 * 1024

    if (
        not file.filename
        or not file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume."
        )

    try:
        pdf_bytes = await file.read(max_size + 1)

        if len(pdf_bytes) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Resume must be 5 MB or smaller."
            )

        resume_text = await run_in_threadpool(
            extract_resume_text,
            pdf_bytes
        )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    finally:
        await file.close()

    try:
        result = await run_in_threadpool(
            generate_resume_question,
            role,
            level,
            resume_text
        )

        return {
            "role": role,
            "level": level,
            "question": result
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Resume question generation failed."
        )


# ==========================================
# 5. AI ANSWER EVALUATION
# ==========================================

@router.post("/evaluate")
async def evaluate(data: EvaluationRequest):
    try:
        return await run_in_threadpool(
            evaluate_answer,
            data.role,
            data.question,
            data.answer,
            data.level
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Answer evaluation failed."
        )


# ==========================================
# 6. COMBINED FINAL REPORT
# ==========================================

@router.post("/report")
async def report(data: ReportRequest):
    try:
        return await run_in_threadpool(
            generate_interview_report,
            data.evaluations,
            data.camera_statistics
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Final interview report failed."
        )
