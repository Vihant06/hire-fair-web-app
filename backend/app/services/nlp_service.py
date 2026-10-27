import re
import fitz  # PyMuPDF
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple, Set
import logging

logger = logging.getLogger(__name__)


class NLPService:
    """Modular NLP pipeline for resume screening"""
    
    def __init__(self, max_features: int = 5000, ngram_range: Tuple[int, int] = (1, 2)):
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            stop_words='english',
            lowercase=True,
            strip_accents='unicode',
            token_pattern=r'\b[a-zA-Z][a-zA-Z0-9+#\.]*\b',  # Keep tech terms like C++, C#, .NET
        )
        self._is_fitted = False
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF using PyMuPDF"""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text.strip()
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def preprocess_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep tech-relevant ones
        text = re.sub(r'[^\w\s+#\.\-]', ' ', text)
        return text.strip().lower()
    
    def extract_skills(self, text: str, known_skills: List[str]) -> Set[str]:
        """Extract known skills from text using case-insensitive matching"""
        text_lower = text.lower()
        found_skills = set()
        for skill in known_skills:
            # Use word boundary matching for better precision
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill)
        return found_skills
    
    def fit_vectorizer(self, texts: List[str]):
        """Fit TF-IDF vectorizer on corpus"""
        processed = [self.preprocess_text(t) for t in texts]
        self.vectorizer.fit(processed)
        self._is_fitted = True
    
    def compute_similarity(self, job_text: str, resume_texts: List[str]) -> np.ndarray:
        """Compute cosine similarity between job description and resumes"""
        if not self._is_fitted:
            # Fit on job + all resumes
            all_texts = [job_text] + resume_texts
            self.fit_vectorizer(all_texts)
        
        job_processed = self.preprocess_text(job_text)
        resumes_processed = [self.preprocess_text(t) for t in resume_texts]
        
        job_vector = self.vectorizer.transform([job_processed])
        resume_vectors = self.vectorizer.transform(resumes_processed)
        
        similarities = cosine_similarity(job_vector, resume_vectors).flatten()
        return similarities
    
    def calculate_match_score(
        self, 
        similarity: float, 
        matched_required: int, 
        total_required: int,
        matched_preferred: int,
        total_preferred: int,
        similarity_weight: float = 0.7,
        skill_weight: float = 0.3
    ) -> float:
        """Calculate final match score combining similarity and skill matching"""
        # Similarity component (0-1)
        sim_score = similarity
        
        # Skill component (0-1)
        required_ratio = matched_required / total_required if total_required > 0 else 1.0
        preferred_ratio = matched_preferred / total_preferred if total_preferred > 0 else 1.0
        skill_score = (required_ratio * 0.7) + (preferred_ratio * 0.3)
        
        # Weighted combination
        final_score = (similarity_weight * sim_score) + (skill_weight * skill_score)
        return min(max(final_score, 0.0), 1.0)  # Clamp to [0, 1]


def create_nlp_service(max_features: int = 5000, ngram_range: Tuple[int, int] = (1, 2)) -> NLPService:
    """Factory function for NLP service"""
    return NLPService(max_features=max_features, ngram_range=ngram_range)