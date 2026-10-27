import base64
import time
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database_models import JobDescription, Candidate, ScreeningJob
from app.models.schemas import JobDescriptionCreate, CandidateResponse
from app.services.nlp_service import NLPService, create_nlp_service
import logging

logger = logging.getLogger(__name__)


class ScreeningService:
    """Service for handling resume screening operations"""
    
    def __init__(self, db: Session, nlp_service: NLPService = None):
        self.db = db
        self.nlp = nlp_service or create_nlp_service()
    
    def create_job(self, job_data: JobDescriptionCreate) -> JobDescription:
        """Create a new job description"""
        job = JobDescription(
            title=job_data.title,
            description=job_data.description,
            required_skills=job_data.required_skills,
            preferred_skills=job_data.preferred_skills,
            experience_level=job_data.experience_level,
            location=job_data.location,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job
    
    def process_resumes(
        self, 
        job_id: str, 
        resume_files: List[bytes], 
        filenames: List[str]
    ) -> List[CandidateResponse]:
        """Process uploaded resumes against job description"""
        start_time = time.time()
        
        # Get job description
        job = self.db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if not job:
            raise ValueError(f"Job not found: {job_id}")
        
        # Create screening job record
        screening_job = ScreeningJob(
            job_id=job_id,
            status="processing",
            total_candidates=len(resume_files),
        )
        self.db.add(screening_job)
        self.db.commit()
        
        try:
            # Extract text from PDFs
            resume_texts = []
            resume_data = []
            
            for pdf_bytes, filename in zip(resume_files, filenames):
                text = self.nlp.extract_text_from_pdf(pdf_bytes)
                resume_texts.append(text)
                resume_data.append({
                    'filename': filename,
                    'text': text,
                })
            
            # Compute similarities
            all_skills = job.required_skills + job.preferred_skills
            similarities = self.nlp.compute_similarity(job.description, resume_texts)
            
            # Process each candidate
            candidates = []
            for i, (resume, similarity) in enumerate(zip(resume_data, similarities)):
                # Extract skills
                matched_skills = self.nlp.extract_skills(resume['text'], all_skills)
                matched_required = len([s for s in matched_skills if s in job.required_skills])
                matched_preferred = len([s for s in matched_skills if s in job.preferred_skills])
                missing_required = [s for s in job.required_skills if s not in matched_skills]
                
                # Calculate final score
                match_score = self.nlp.calculate_match_score(
                    similarity=similarity,
                    matched_required=matched_required,
                    total_required=len(job.required_skills),
                    matched_preferred=matched_preferred,
                    total_preferred=len(job.preferred_skills),
                )
                
                # Extract candidate info from resume (simple heuristics)
                name = self._extract_name(resume['text'])
                email = self._extract_email(resume['text'])
                phone = self._extract_phone(resume['text'])
                experience = self._extract_experience(resume['text'])
                education = self._extract_education(resume['text'])
                
                candidate = Candidate(
                    job_id=job_id,
                    name=name or f"Candidate {i+1}",
                    email=email or f"candidate{i+1}@example.com",
                    phone=phone,
                    resume_text=resume['text'][:5000],  # Store truncated
                    experience=experience,
                    education=education,
                    match_score=match_score,
                    matched_skills=list(matched_skills),
                    missing_skills=missing_required,
                )
                self.db.add(candidate)
                candidates.append(candidate)
            
            self.db.commit()
            
            # Update screening job
            processing_time = int((time.time() - start_time) * 1000)
            screening_job.status = "completed"
            screening_job.processed_candidates = len(candidates)
            screening_job.processing_time_ms = processing_time
            screening_job.completed_at = time.time()
            self.db.commit()
            
            # Return sorted by match score (highest first)
            candidates.sort(key=lambda c: c.match_score, reverse=True)
            return [self._to_response(c) for c in candidates]
            
        except Exception as e:
            screening_job.status = "failed"
            self.db.commit()
            logger.error(f"Screening failed: {e}")
            raise
    
    def get_candidates(self, job_id: str) -> List[CandidateResponse]:
        """Get all candidates for a job, sorted by match score"""
        candidates = self.db.query(Candidate).filter(
            Candidate.job_id == job_id
        ).order_by(Candidate.match_score.desc()).all()
        return [self._to_response(c) for c in candidates]
    
    def get_job(self, job_id: str) -> JobDescription:
        return self.db.query(JobDescription).filter(JobDescription.id == job_id).first()
    
    def _to_response(self, candidate: Candidate) -> CandidateResponse:
        return CandidateResponse(
            id=candidate.id,
            name=candidate.name,
            email=candidate.email,
            phone=candidate.phone,
            resume_text=candidate.resume_text,
            experience=candidate.experience,
            education=candidate.education,
            match_score=candidate.match_score,
            matched_skills=candidate.matched_skills,
            missing_skills=candidate.missing_skills,
            created_at=candidate.created_at,
        )
    
    def _extract_name(self, text: str) -> str:
        """Simple name extraction - first line that looks like a name"""
        lines = text.split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and len(line.split()) >= 2 and len(line) < 50:
                # Skip lines that look like headers
                if not any(kw in line.lower() for kw in ['resume', 'cv', 'curriculum', 'vitae', 'profile']):
                    return line
        return None
    
    def _extract_email(self, text: str) -> str:
        import re
        match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        return match.group(0) if match else None
    
    def _extract_phone(self, text: str) -> str:
        import re
        match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        return match.group(0) if match else None
    
    def _extract_experience(self, text: str) -> str:
        import re
        # Look for patterns like "5 years", "3+ years experience"
        match = re.search(r'(\d+\+?\s*years?\s*(?:of\s*)?experience)', text, re.IGNORECASE)
        return match.group(1) if match else None
    
    def _extract_education(self, text: str) -> str:
        import re
        # Look for degree patterns
        patterns = [
            r'(Bachelor|Master|PhD|BS|MS|BA|MA|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.)\s+(?:of\s+|in\s+)?[A-Za-z\s]+',
            r'(University|College|Institute)\s+of\s+[A-Za-z\s]+',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)[:100]
        return None


def create_screening_service(db: Session) -> ScreeningService:
    return ScreeningService(db)