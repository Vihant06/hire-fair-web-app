from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ScreeningStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobDescriptionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    location: Optional[str] = None


class JobDescriptionCreate(JobDescriptionBase):
    pass


class JobDescriptionResponse(JobDescriptionBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CandidateBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    resume_text: str
    experience: Optional[str] = None
    education: Optional[str] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateResponse(CandidateBase):
    id: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScreeningRequest(BaseModel):
    job_description: JobDescriptionCreate
    resume_files: List[str] = Field(default_factory=list)  # base64 encoded PDFs


class ScreeningResult(BaseModel):
    job_id: str
    candidates: List[CandidateResponse]
    status: ScreeningStatus
    created_at: datetime
    processing_time_ms: Optional[int] = None


class FairnessMetrics(BaseModel):
    demographic_parity_difference: float
    equalized_odds_difference: float
    selection_rate_by_group: dict[str, float]
    baseline_metrics: dict[str, float]
    debiased_metrics: dict[str, float]


class BiasAuditData(BaseModel):
    group: str
    baseline_selection_rate: float
    debiased_selection_rate: float
    candidate_count: int


class AuditReport(BaseModel):
    generated_at: datetime
    model_version: str
    data_source: str
    fairness_metrics: FairnessMetrics
    bias_audit_data: List[BiasAuditData]
    limitations: List[str]
    recommendations: List[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime