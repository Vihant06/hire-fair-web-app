from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import base64
from app.db.database import get_db
from app.models.schemas import (
    JobDescriptionCreate, JobDescriptionResponse,
    CandidateResponse, ScreeningRequest, ScreeningResult,
    FairnessMetrics, BiasAuditData, AuditReport, HealthResponse
)
from app.services.screening_service import ScreeningService, create_screening_service
from app.services.fairness_service import FairnessService, create_fairness_service
from app.models.database_models import JobDescription
import numpy as np
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_screening_service(db: Session = Depends(get_db)) -> ScreeningService:
    return create_screening_service(db)


def get_fairness_service() -> FairnessService:
    return create_fairness_service()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=__import__('datetime').datetime.utcnow()
    )


@router.post("/jobs", response_model=JobDescriptionResponse)
async def create_job(
    job_data: JobDescriptionCreate,
    service: ScreeningService = Depends(get_screening_service)
):
    """Create a new job description"""
    job = service.create_job(job_data)
    return JobDescriptionResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        required_skills=job.required_skills,
        preferred_skills=job.preferred_skills,
        experience_level=job.experience_level,
        location=job.location,
        created_at=job.created_at,
    )


@router.get("/jobs/{job_id}", response_model=JobDescriptionResponse)
async def get_job(
    job_id: str,
    service: ScreeningService = Depends(get_screening_service)
):
    """Get job description by ID"""
    job = service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobDescriptionResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        required_skills=job.required_skills,
        preferred_skills=job.preferred_skills,
        experience_level=job.experience_level,
        location=job.location,
        created_at=job.created_at,
    )


@router.post("/screen", response_model=ScreeningResult)
async def screen_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...),
    service: ScreeningService = Depends(get_screening_service)
):
    """Screen uploaded resumes against job description"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    # Validate file types
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF files allowed.")
    
    # Read file contents
    resume_bytes = []
    filenames = []
    for file in files:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail=f"File too large: {file.filename}")
        resume_bytes.append(content)
        filenames.append(file.filename)
    
    try:
        candidates = service.process_resumes(job_id, resume_bytes, filenames)
        return ScreeningResult(
            job_id=job_id,
            candidates=candidates,
            status="completed",
            created_at=__import__('datetime').datetime.utcnow(),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Screening failed: {e}")
        raise HTTPException(status_code=500, detail="Screening processing failed")


@router.get("/jobs/{job_id}/candidates", response_model=List[CandidateResponse])
async def get_candidates(
    job_id: str,
    service: ScreeningService = Depends(get_screening_service)
):
    """Get all screened candidates for a job"""
    job = service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return service.get_candidates(job_id)


@router.get("/fairness/audit", response_model=AuditReport)
async def get_fairness_audit(
    service: FairnessService = Depends(get_fairness_service)
):
    """Get fairness audit report (demo with synthetic data)"""
    # Generate synthetic data for demo
    np.random.seed(42)
    n_samples = 500
    
    # Simulate predictions, labels, groups
    predictions = np.random.beta(2, 2, n_samples)
    labels = np.random.binomial(1, 0.3, n_samples)
    groups = np.random.choice(["Group A", "Group B", "Group C", "Group D"], n_samples)
    
    fairness_metrics = service.compute_fairness_metrics(predictions, labels, groups)
    bias_audit_data = service.create_bias_audit_data(predictions, labels, groups)
    report = service.generate_audit_report(fairness_metrics, bias_audit_data)
    
    return report


@router.post("/fairness/evaluate", response_model=FairnessMetrics)
async def evaluate_fairness(
    predictions: List[float],
    labels: List[int],
    groups: List[str],
    threshold: float = 0.5,
    service: FairnessService = Depends(get_fairness_service)
):
    """Evaluate fairness metrics on provided data"""
    if len(predictions) != len(labels) or len(predictions) != len(groups):
        raise HTTPException(status_code=400, detail="Array lengths must match")
    
    return service.compute_fairness_metrics(
        np.array(predictions),
        np.array(labels),
        np.array(groups),
        threshold
    )