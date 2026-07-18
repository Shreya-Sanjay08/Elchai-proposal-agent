"""
main.py — FastAPI server for Elchai AI Proposal Agent
Elchai Group Assessment | Shreya Sanjay
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from agents import run_pipeline

app = FastAPI(title="Proposal Agent", version="1.0.0")

# CORS — allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/static", StaticFiles(directory=frontend_path), name="static")


class BriefRequest(BaseModel):
    brief: str


@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join(frontend_path, "index.html"))


@app.post("/api/generate")
async def generate_proposal(request: BriefRequest):
    if not request.brief or len(request.brief.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide a more detailed client brief.")

    if len(request.brief) > 5000:
        raise HTTPException(status_code=400, detail="Brief too long. Maximum 5000 characters.")

    result = run_pipeline(request.brief)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {result.get('error', 'Unknown error')}")

    return result


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Elchai AI Proposal Agent"}