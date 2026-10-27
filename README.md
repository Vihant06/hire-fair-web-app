# HireFair — AI-Powered Fair Resume Screening ATS

A modern, responsive web application for debiasing NLP models in automated resume screening and applicant tracking systems (ATS). Built with Next.js, FastAPI, and scikit-learn.

## Features

- **4 Pages**: Dashboard, Resume Screening, Candidate Insights, Fairness & Bias Audit
- **AI/ML Pipeline**: PDF parsing (PyMuPDF), TF-IDF vectorization, cosine similarity, skill matching
- **Fairness Audit**: Demographic parity, equalized odds, selection rate comparisons, exportable reports
- **Explainable AI**: Transparent score breakdowns with evidence from resume text
- **Production-Ready**: Docker support, SQLite/PostgreSQL, CI/CD ready

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | FastAPI, Python 3.11, SQLAlchemy, SQLite/PostgreSQL |
| ML/NLP | scikit-learn (TF-IDF, cosine similarity), PyMuPDF |
| Deployment | Docker, Vercel (frontend), Render/Railway (backend) |

## Project Structure

```
hirefair/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── page.tsx     # Dashboard
│   │   │   ├── screening/   # Resume Screening
│   │   │   ├── insights/    # Candidate Insights
│   │   │   └── fairness/    # Fairness & Bias Audit
│   │   ├── components/      # UI components (shadcn/ui)
│   │   ├── lib/             # Utilities, API client, mock data
│   │   └── types/           # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/routes.py    # API endpoints
│   │   ├── core/config.py   # Settings
│   │   ├── db/database.py   # Database connection
│   │   ├── models/          # Pydantic & SQLAlchemy models
│   │   ├── services/        # Business logic (NLP, screening, fairness)
│   │   └── main.py          # FastAPI app entry
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (optional)

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`  
Docs at `http://localhost:8000/docs`

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App available at `http://localhost:3000`

### Docker (Full Stack)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/jobs` | Create job description |
| GET | `/api/v1/jobs/{id}` | Get job description |
| POST | `/api/v1/screen` | Screen resumes (multipart/form-data) |
| GET | `/api/v1/jobs/{id}/candidates` | Get screened candidates |
| GET | `/api/v1/fairness/audit` | Get fairness audit report |
| POST | `/api/v1/fairness/evaluate` | Evaluate fairness metrics |

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1`
4. Deploy

### Render/Railway (Backend)

1. Create new Web Service
2. Connect GitHub repo, select `backend` folder
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables:
   - `DATABASE_URL` (PostgreSQL for production)
   - `CORS_ORIGINS=https://your-frontend.vercel.app`

### PostgreSQL (Production)

Update `DATABASE_URL` in backend:
```
postgresql://user:password@host:5432/hirefair
```

Run migrations on startup (add to `main.py`):
```python
from app.db.database import init_db
init_db()  # Creates tables
```

## Fairness Metrics Explained

| Metric | Formula | Threshold | Interpretation |
|--------|---------|-----------|----------------|
| Demographic Parity | \|Selection Rate(A) - Selection Rate(B)\| | ≤ 20% | Equal selection rates across groups |
| Equalized Odds | max(\|TPR_A - TPR_B\|, \|FPR_A - FPR_B\|) | ≤ 15% | Equal error rates across groups |
| Selection Rate Parity | max(rates) - min(rates) | ≤ 15% | Balanced selection rates |

**Important**: Improving one metric does not guarantee overall fairness. Metrics can conflict. Always involve legal/DEI stakeholders in threshold decisions.

## Limitations

- Synthetic demo data — connect real pipeline for production
- TF-IDF captures term frequency, not semantic meaning
- Skill matching uses exact string matching
- No assessment of soft skills or cultural fit
- AI scores inform, never auto-reject candidates

## License

MIT License — see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request