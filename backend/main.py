

from fastapi import FastAPI
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI(title="Mock2Real Backend")

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

    interviews[session_id] = {
        "role": request.role,
        "difficulty": request.difficulty,
        "questions": [first_question],
        "answers": []
    }

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

    if request.session_id not in interviews:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    interview = interviews[request.session_id]

    interview["answers"].append(request.answer)

    answer_count = len(interview["answers"])

    next_question = (
        f"Can you explain more about your experience "
        f"related to {interview['role']}?"
    )

    interview["questions"].append(next_question)

    return {
        "session_id": request.session_id,
        "answer_saved": True,
        "answer_count": answer_count,
        "next_question": next_question
    }


@app.post("/finish-interview/{session_id}")
def finish_interview(session_id: str):

    if session_id not in interviews:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    interview = interviews[session_id]
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

    return report
