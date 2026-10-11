from fastapi import FastAPI
from member3.ai_routes import router

app = FastAPI(title="Mock2Real AI Backend")

app.include_router(router)