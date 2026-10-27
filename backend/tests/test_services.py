import pytest
import numpy as np
from app.services.nlp_service import create_nlp_service
from app.services.fairness_service import create_fairness_service


class TestNLPService:
    @pytest.fixture
    def nlp(self):
        return create_nlp_service()
    
    def test_preprocess_text(self, nlp):
        text = "  Senior   React Developer  with 5+ YEARS experience!  "
        result = nlp.preprocess_text(text)
        assert "senior" in result
        assert "react" in result
        assert "developer" in result
        assert "5" in result or "years" in result
    
    def test_extract_skills(self, nlp):
        text = "Experienced in React, TypeScript, and Node.js. Also knows Python."
        skills = ["React", "TypeScript", "Node.js", "Python", "Java"]
        found = nlp.extract_skills(text, skills)
        assert "React" in found
        assert "TypeScript" in found
        assert "Node.js" in found
        assert "Python" in found
        assert "Java" not in found
    
    def test_compute_similarity(self, nlp):
        job = "Senior React Developer with TypeScript and GraphQL experience"
        resumes = [
            "React developer with 5 years TypeScript experience",
            "Java developer with Spring Boot experience",
            "Frontend engineer expert in React, TypeScript, GraphQL",
        ]
        similarities = nlp.compute_similarity(job, resumes)
        assert len(similarities) == 3
        assert all(0 <= s <= 1 for s in similarities)
        # Third resume should be most similar
        assert similarities[2] == max(similarities)
    
    def test_calculate_match_score(self, nlp):
        score = nlp.calculate_match_score(
            similarity=0.8,
            matched_required=4,
            total_required=5,
            matched_preferred=2,
            total_preferred=3,
        )
        assert 0 <= score <= 1
        assert score > 0.8 * 0.7  # Should be weighted toward similarity


class TestFairnessService:
    @pytest.fixture
    def fairness(self):
        return create_fairness_service()
    
    def test_compute_fairness_metrics(self, fairness):
        np.random.seed(42)
        n = 200
        predictions = np.random.beta(2, 2, n)
        labels = np.random.binomial(1, 0.3, n)
        groups = np.random.choice(["A", "B", "C"], n)
        
        metrics = fairness.compute_fairness_metrics(predictions, labels, groups)
        
        assert 0 <= metrics.demographic_parity_difference <= 1
        assert 0 <= metrics.equalized_odds_difference <= 1
        assert len(metrics.selection_rate_by_group) == 3
        assert all(0 <= v <= 1 for v in metrics.selection_rate_by_group.values())
        assert "accuracy" in metrics.baseline_metrics
        assert "precision" in metrics.baseline_metrics
    
    def test_generate_audit_report(self, fairness):
        from app.models.schemas import FairnessMetrics, BiasAuditData
        
        metrics = FairnessMetrics(
            demographic_parity_difference=0.12,
            equalized_odds_difference=0.08,
            selection_rate_by_group={"A": 0.7, "B": 0.65},
            baseline_metrics={"accuracy": 0.82, "precision": 0.79, "recall": 0.76, "f1_score": 0.77, "selection_rate": 0.68},
            debiased_metrics={"accuracy": 0.80, "precision": 0.77, "recall": 0.78, "f1_score": 0.77, "selection_rate": 0.69},
        )
        
        audit_data = [
            BiasAuditData(group="A", baseline_selection_rate=0.68, debiased_selection_rate=0.72, candidate_count=100),
            BiasAuditData(group="B", baseline_selection_rate=0.62, debiased_selection_rate=0.68, candidate_count=90),
        ]
        
        report = fairness.generate_audit_report(metrics, audit_data)
        
        assert report.model_version == "v1.0.0"
        assert len(report.limitations) > 0
        assert len(report.recommendations) > 0
        assert report.fairness_metrics.demographic_parity_difference == 0.12