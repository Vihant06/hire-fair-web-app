const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/backend';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  health: () => fetchApi<{ status: string; version: string; timestamp: string }>('/health'),

  jobs: {
    create: (data: {
      title: string;
      description: string;
      required_skills: string[];
      preferred_skills: string[];
      experience_level?: string;
      location?: string;
    }) => fetchApi<{
      id: string;
      title: string;
      description: string;
      required_skills: string[];
      preferred_skills: string[];
      experience_level?: string;
      location?: string;
      created_at: string;
    }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    get: (id: string) => fetchApi<{
      id: string;
      title: string;
      description: string;
      required_skills: string[];
      preferred_skills: string[];
      experience_level?: string;
      location?: string;
      created_at: string;
    }>(`/jobs/${id}`),
  },

  screening: {
    screen: async (jobId: string, files: File[]) => {
      const formData = new FormData();
      formData.append('job_id', jobId);
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`${API_BASE}/screen`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Screening failed' }));
        throw new ApiError(response.status, error.detail);
      }

      return response.json() as Promise<{
        job_id: string;
        candidates: Array<{
          id: string;
          name: string;
          email: string;
          phone?: string;
          resume_text: string;
          experience?: string;
          education?: string;
          match_score: number;
          matched_skills: string[];
          missing_skills: string[];
          created_at: string;
        }>;
        status: string;
        created_at: string;
      }>;
    },

    getCandidates: (jobId: string) => fetchApi<Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      resume_text: string;
      experience?: string;
      education?: string;
      match_score: number;
      matched_skills: string[];
      missing_skills: string[];
      created_at: string;
    }>>(`/jobs/${jobId}/candidates`),
  },

  fairness: {
    getAudit: () => fetchApi<{
      generated_at: string;
      model_version: string;
      data_source: string;
      fairness_metrics: {
        demographic_parity_difference: number;
        equalized_odds_difference: number;
        selection_rate_by_group: Record<string, number>;
        baseline_metrics: Record<string, number>;
        debiased_metrics: Record<string, number>;
      };
      bias_audit_data: Array<{
        group: string;
        baseline_selection_rate: number;
        debiased_selection_rate: number;
        candidate_count: number;
      }>;
      limitations: string[];
      recommendations: string[];
    }>('/fairness/audit'),

    evaluate: (data: {
      predictions: number[];
      labels: number[];
      groups: string[];
      threshold?: number;
    }) => fetchApi<{
      demographic_parity_difference: number;
      equalized_odds_difference: number;
      selection_rate_by_group: Record<string, number>;
      baseline_metrics: Record<string, number>;
      debiased_metrics: Record<string, number>;
    }>('/fairness/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};

export { ApiError };