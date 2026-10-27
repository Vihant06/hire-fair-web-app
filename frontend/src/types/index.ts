export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  resumeText: string;
  experience: string;
  education: string;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  location: string;
}

export interface ScreeningResult {
  jobId: string;
  candidates: Candidate[];
  createdAt: string;
  status: "completed" | "processing" | "failed";
}

export interface DashboardStats {
  totalResumesScreened: number;
  activeJobOpenings: number;
  averageMatchScore: number;
  fairnessScore: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "screening" | "job_created" | "candidate_reviewed";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface FairnessMetrics {
  demographicParityDifference: number;
  equalizedOddsDifference: number;
  selectionRateByGroup: Record<string, number>;
  baselineMetrics: ModelMetrics;
  debiasedMetrics: ModelMetrics;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  selectionRate: number;
}

export interface BiasAuditData {
  group: string;
  baselineSelectionRate: number;
  debiasedSelectionRate: number;
  candidateCount: number;
}

export interface SkillMatch {
  skill: string;
  matched: boolean;
  evidence: string;
  importance: "required" | "preferred";
}