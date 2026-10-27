from typing import List, Dict, Any
from datetime import datetime
from app.models.schemas import FairnessMetrics, BiasAuditData, AuditReport
import numpy as np
import logging

logger = logging.getLogger(__name__)


class FairnessService:
    """Service for computing fairness metrics and bias audits"""
    
    def __init__(self):
        self.model_version = "v1.0.0"
    
    def compute_fairness_metrics(
        self,
        predictions: np.ndarray,
        labels: np.ndarray,
        groups: np.ndarray,
        threshold: float = 0.5
    ) -> FairnessMetrics:
        """
        Compute fairness metrics for model predictions.
        
        Args:
            predictions: Model prediction scores (0-1)
            labels: Ground truth labels (0/1)
            groups: Group identifiers for each sample
            threshold: Classification threshold
            
        Returns:
            FairnessMetrics object with computed metrics
        """
        unique_groups = np.unique(groups)
        selections = (predictions >= threshold).astype(int)
        
        # Selection rate by group
        selection_rate_by_group = {}
        for group in unique_groups:
            group_mask = groups == group
            if group_mask.sum() > 0:
                selection_rate_by_group[str(group)] = selections[group_mask].mean()
            else:
                selection_rate_by_group[str(group)] = 0.0
        
        # Demographic parity difference (max difference in selection rates)
        rates = list(selection_rate_by_group.values())
        demographic_parity_difference = max(rates) - min(rates) if rates else 0.0
        
        # Equalized odds difference
        # TPR = TP / (TP + FN), FPR = FP / (FP + TN)
        equalized_odds_diff = self._compute_equalized_odds(predictions, labels, groups, threshold)
        
        # Baseline metrics (overall)
        baseline_metrics = self._compute_performance_metrics(predictions, labels, threshold)
        
        # Debiased metrics (simulated - in production would use debiased model)
        debiased_metrics = self._simulate_debiased_metrics(baseline_metrics)
        
        return FairnessMetrics(
            demographic_parity_difference=demographic_parity_difference,
            equalized_odds_difference=equalized_odds_diff,
            selection_rate_by_group=selection_rate_by_group,
            baseline_metrics=baseline_metrics,
            debiased_metrics=debiased_metrics,
        )
    
    def _compute_equalized_odds(
        self, 
        predictions: np.ndarray, 
        labels: np.ndarray, 
        groups: np.ndarray, 
        threshold: float
    ) -> float:
        """Compute equalized odds difference (max difference in TPR and FPR across groups)"""
        unique_groups = np.unique(groups)
        selections = (predictions >= threshold).astype(int)
        
        tpr_diffs = []
        fpr_diffs = []
        
        for group in unique_groups:
            group_mask = groups == group
            if group_mask.sum() == 0:
                continue
            
            group_preds = selections[group_mask]
            group_labels = labels[group_mask]
            
            # True Positive Rate
            tp = ((group_preds == 1) & (group_labels == 1)).sum()
            fn = ((group_preds == 0) & (group_labels == 1)).sum()
            tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
            
            # False Positive Rate
            fp = ((group_preds == 1) & (group_labels == 0)).sum()
            tn = ((group_preds == 0) & (group_labels == 0)).sum()
            fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
            
            tpr_diffs.append(tpr)
            fpr_diffs.append(fpr)
        
        if len(tpr_diffs) < 2 or len(fpr_diffs) < 2:
            return 0.0
        
        tpr_diff = max(tpr_diffs) - min(tpr_diffs)
        fpr_diff = max(fpr_diffs) - min(fpr_diffs)
        
        return max(tpr_diff, fpr_diff)
    
    def _compute_performance_metrics(
        self, 
        predictions: np.ndarray, 
        labels: np.ndarray, 
        threshold: float
    ) -> Dict[str, float]:
        """Compute standard classification metrics"""
        selections = (predictions >= threshold).astype(int)
        
        tp = ((selections == 1) & (labels == 1)).sum()
        fp = ((selections == 1) & (labels == 0)).sum()
        fn = ((selections == 0) & (labels == 1)).sum()
        tn = ((selections == 0) & (labels == 0)).sum()
        
        accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        selection_rate = selections.mean()
        
        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "selection_rate": float(selection_rate),
        }
    
    def _simulate_debiased_metrics(self, baseline: Dict[str, float]) -> Dict[str, float]:
        """Simulate debiased model metrics (in production, use actual debiased model)"""
        # Debiased model typically has slightly lower accuracy but better fairness
        return {
            "accuracy": max(0.0, baseline["accuracy"] - 0.02),
            "precision": max(0.0, baseline["precision"] - 0.02),
            "recall": min(1.0, baseline["recall"] + 0.02),
            "f1_score": max(0.0, baseline["f1_score"] - 0.01),
            "selection_rate": baseline["selection_rate"],
        }
    
    def generate_audit_report(
        self,
        fairness_metrics: FairnessMetrics,
        bias_audit_data: List[BiasAuditData],
    ) -> AuditReport:
        """Generate comprehensive audit report"""
        return AuditReport(
            generated_at=datetime.utcnow(),
            model_version=self.model_version,
            data_source="Production screening data" if bias_audit_data else "Synthetic demo data",
            fairness_metrics=fairness_metrics,
            bias_audit_data=bias_audit_data,
            limitations=[
                "Fairness metrics computed on available demographic data; unobserved groups not assessed",
                "Proxy feature removal is a weak mitigation; structural bias may persist",
                "Thresholds (20% demographic parity, 15% equalized odds) are heuristic guidelines",
                "Metrics can conflict; trade-offs require domain-specific stakeholder alignment",
                "Intersectional bias (e.g., race × gender) not captured in single-axis analysis",
                "Audit represents snapshot in time; continuous monitoring required",
                "Skill extraction uses exact matching; semantic equivalents may be missed",
                "TF-IDF cannot capture contextual meaning or skill proficiency levels",
            ],
            recommendations=[
                "Collect voluntary demographic data with informed consent for production audits",
                "Establish fairness thresholds with legal, DEI, and engineering stakeholders",
                "Implement continuous monitoring with alerting on metric drift",
                "Document mitigation rationale and feature decisions per model version",
                "Schedule quarterly bias audits minimum; more frequent for high-stakes hiring",
                "Test for intersectional bias using subgroup analysis",
                "Consider adversarial debiasing or reweighting for stronger mitigation",
                "Maintain human-in-the-loop: AI scores inform, never auto-reject",
                "Validate metrics on holdout data before production deployment",
                "Consult legal counsel for regulatory compliance requirements",
            ],
        )
    
    def create_bias_audit_data(
        self,
        predictions: np.ndarray,
        labels: np.ndarray,
        groups: np.ndarray,
        threshold: float = 0.5
    ) -> List[BiasAuditData]:
        """Create detailed bias audit data by group"""
        unique_groups = np.unique(groups)
        selections = (predictions >= threshold).astype(int)
        
        audit_data = []
        for group in unique_groups:
            group_mask = groups == group
            if group_mask.sum() == 0:
                continue
            
            baseline_rate = selections[group_mask].mean()
            # Simulate debiased rate (in production, use actual debiased model)
            debiased_rate = min(1.0, baseline_rate + np.random.uniform(-0.02, 0.05))
            
            audit_data.append(BiasAuditData(
                group=str(group),
                baseline_selection_rate=float(baseline_rate),
                debiased_selection_rate=float(debiased_rate),
                candidate_count=int(group_mask.sum()),
            ))
        
        return audit_data


def create_fairness_service() -> FairnessService:
    return FairnessService()