import type { DashboardStats, ActivityItem, Candidate, JobDescription, FairnessMetrics, BiasAuditData } from "@/types";

export const mockDashboardStats: DashboardStats = {
  totalResumesScreened: 1247,
  activeJobOpenings: 12,
  averageMatchScore: 73,
  fairnessScore: 87,
  recentActivity: [
    {
      id: "1",
      type: "screening",
      title: "Senior Frontend Developer Screening",
      description: "Screened 45 resumes, 12 strong matches found",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      type: "job_created",
      title: "New Job Posting: Data Scientist",
      description: "Created job opening for Data Scientist role",
      timestamp: "2024-01-14T14:22:00Z",
    },
    {
      id: "3",
      type: "candidate_reviewed",
      title: "Candidate Review: Sarah Chen",
      description: "Reviewed top candidate for Backend Engineer role",
      timestamp: "2024-01-13T09:15:00Z",
    },
    {
      id: "4",
      type: "screening",
      title: "Product Manager Screening",
      description: "Screened 28 resumes, 8 strong matches found",
      timestamp: "2024-01-12T16:45:00Z",
    },
    {
      id: "5",
      type: "job_created",
      title: "New Job Posting: DevOps Engineer",
      description: "Created job opening for DevOps Engineer role",
      timestamp: "2024-01-11T11:00:00Z",
    },
  ],
};

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 123-4567",
    matchScore: 92,
    matchedSkills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Testing"],
    missingSkills: ["Kubernetes"],
    resumeText: "Experienced Frontend Engineer with 6+ years building scalable web applications. Led frontend architecture for e-commerce platform serving 2M+ users. Expert in React, TypeScript, and modern frontend tooling. Strong background in performance optimization and accessibility.",
    experience: "6 years",
    education: "BS Computer Science, Stanford University",
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    phone: "+1 (555) 234-5678",
    matchScore: 87,
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "CI/CD"],
    missingSkills: ["GraphQL", "Kubernetes", "AWS"],
    resumeText: "Full-stack developer with 5 years experience building production applications. Proficient in React ecosystem, database design, and DevOps practices. Led migration from REST to GraphQL APIs. Experience with containerized deployments.",
    experience: "5 years",
    education: "MS Software Engineering, Carnegie Mellon",
  },
  {
    id: "c3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 345-6789",
    matchScore: 84,
    matchedSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Testing", "Accessibility"],
    missingSkills: ["Node.js", "GraphQL", "AWS", "Docker"],
    resumeText: "Frontend specialist with 4 years building responsive, accessible web applications. Expert in React, Next.js, and modern CSS. Published articles on frontend performance and accessibility. Strong design systems experience.",
    experience: "4 years",
    education: "BS Human-Computer Interaction, Georgia Tech",
  },
  {
    id: "c4",
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1 (555) 456-7890",
    matchScore: 78,
    matchedSkills: ["React", "JavaScript", "Node.js", "MongoDB", "Express"],
    missingSkills: ["TypeScript", "GraphQL", "AWS", "Testing", "Docker", "Kubernetes"],
    resumeText: "Full-stack developer with 3 years experience. Built multiple MERN stack applications. Self-taught with strong problem-solving skills. Contributing to open-source projects. Eager to learn TypeScript and cloud technologies.",
    experience: "3 years",
    education: "BS Information Systems, University of Washington",
  },
  {
    id: "c5",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+1 (555) 567-8901",
    matchScore: 75,
    matchedSkills: ["React", "TypeScript", "Redux", "Jest", "Cypress"],
    missingSkills: ["Node.js", "GraphQL", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
    resumeText: "Frontend engineer with 3 years focusing on state management and testing. Expert in React, Redux, and testing frameworks. Built component libraries used across organization. Mentoring junior developers on best practices.",
    experience: "3 years",
    education: "MS Computer Science, UT Austin",
  },
];

export const mockJobDescription: JobDescription = {
  id: "job1",
  title: "Senior Frontend Engineer",
  description: `We are looking for a Senior Frontend Engineer to join our growing team. You will be responsible for building and maintaining our core web application, working closely with designers and backend engineers to deliver exceptional user experiences.

Key Responsibilities:
- Architect and build scalable frontend solutions using React and TypeScript
- Collaborate with design team to implement pixel-perfect, accessible interfaces
- Optimize application performance and bundle size
- Mentor junior developers and establish frontend best practices
- Participate in code reviews and technical discussions

Requirements:
- 5+ years of professional frontend development experience
- Expert knowledge of React, TypeScript, and modern frontend tooling
- Experience with GraphQL, state management (Redux/Zustand)
- Strong understanding of web performance, accessibility, and SEO
- Experience with testing frameworks (Jest, Cypress, React Testing Library)
- Familiarity with cloud platforms (AWS/GCP) and containerization (Docker)

Preferred Qualifications:
- Experience with Next.js and server-side rendering
- Knowledge of Kubernetes and microservices architecture
- Open source contributions
- Experience mentoring junior engineers`,
  requiredSkills: ["React", "TypeScript", "GraphQL", "Testing", "Node.js", "AWS"],
  preferredSkills: ["Next.js", "Kubernetes", "Docker", "CI/CD", "PostgreSQL"],
  experienceLevel: "Senior (5+ years)",
  location: "San Francisco, CA (Hybrid)",
};

export const mockFairnessMetrics: FairnessMetrics = {
  demographicParityDifference: 0.12,
  equalizedOddsDifference: 0.08,
  selectionRateByGroup: {
    "Group A": 0.72,
    "Group B": 0.68,
    "Group C": 0.75,
    "Group D": 0.70,
  },
  baselineMetrics: {
    accuracy: 0.82,
    precision: 0.79,
    recall: 0.76,
    f1Score: 0.77,
    selectionRate: 0.71,
  },
  debiasedMetrics: {
    accuracy: 0.80,
    precision: 0.77,
    recall: 0.78,
    f1Score: 0.77,
    selectionRate: 0.72,
  },
};

export const mockBiasAuditData: BiasAuditData[] = [
  { group: "Group A", baselineSelectionRate: 0.68, debiasedSelectionRate: 0.72, candidateCount: 145 },
  { group: "Group B", baselineSelectionRate: 0.62, debiasedSelectionRate: 0.68, candidateCount: 132 },
  { group: "Group C", baselineSelectionRate: 0.71, debiasedSelectionRate: 0.75, candidateCount: 98 },
  { group: "Group D", baselineSelectionRate: 0.65, debiasedSelectionRate: 0.70, candidateCount: 115 },
];