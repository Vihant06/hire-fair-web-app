from sqlalchemy import Column, String, Text, DateTime, Float, JSON, Integer
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from datetime import datetime
from app.db.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(SQLiteJSON, default=list)
    preferred_skills = Column(SQLiteJSON, default=list)
    experience_level = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    resume_text = Column(Text, nullable=False)
    experience = Column(String(100), nullable=True)
    education = Column(String(200), nullable=True)
    match_score = Column(Float, nullable=False)
    matched_skills = Column(SQLiteJSON, default=list)
    missing_skills = Column(SQLiteJSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScreeningJob(Base):
    __tablename__ = "screening_jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, nullable=False, index=True)
    status = Column(String(20), default="pending")
    total_candidates = Column(Integer, default=0)
    processed_candidates = Column(Integer, default=0)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)