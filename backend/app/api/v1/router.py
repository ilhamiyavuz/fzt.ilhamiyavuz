from fastapi import APIRouter

from app.api.v1 import ai_analysis, auth, exercises, pain_logs, patients, physiotherapists

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(physiotherapists.router, prefix="/physiotherapists", tags=["physiotherapists"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(pain_logs.router, prefix="/pain-logs", tags=["pain-logs"])
api_router.include_router(ai_analysis.router, prefix="/ai-analysis", tags=["ai-analysis"])
