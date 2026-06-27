<div align="center">

# 🤖 AI Data Science Agent Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Microservices-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM%20Planner-7C3AED?logoColor=white)](https://openrouter.ai/)
[![scikit-learn](https://img.shields.io/badge/Scikit--Learn-ML%20Advisor-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![pandas](https://img.shields.io/badge/Pandas-Data%20Profiling-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-Report%20Generation-CC0000?logoColor=white)](https://www.reportlab.com/)

[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-blueviolet?logoColor=white)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

A **production-style microservice platform** for automated data science workflows. Upload a CSV or Excel file and the platform profiles your data quality, generates a deterministic cleaning plan, creates visualizations, provides ML model recommendations, and exports a full HTML/PDF report — all in one pipeline.

The LLM **plans and explains**. Deterministic Python services **perform the actual data operations** — ensuring safety, reproducibility, and auditability.

---

## ✨ Why This Project?

Most data science pipelines are either fully manual or rely blindly on LLMs to manipulate data. This platform takes a different approach:

- 🧠 **LLM as a planner only** — OpenRouter generates structured JSON recommendations, never touches the data
- 🔒 **Allow-listed cleaning actions** — the cleaning service only executes safe, pre-approved deterministic operations
- 📊 **End-to-end automation** — from raw upload to downloadable clean CSV and PDF report in seconds
- 🐳 **One-command deployment** — all services spin up via Docker Compose

---

## 🖥️ Dashboard

<!-- Replace with your actual screenshots -->
> Upload a file → get a full analysis in seconds

The dashboard provides:

- 📈 Dataset profile metrics (rows, columns, missing values, duplicates)
- 🚨 Data quality findings and risk detection
- ✅ Cleaning action plan with toggle controls
- 📊 Auto-generated charts (distribution, correlation, outliers)
- 🤖 ML task detection and model recommendations
- 📄 One-click HTML and PDF report export

---

## 🧪 Tested Datasets

### 🫀 Stroke Prediction Dataset

A medical classification dataset used to validate the full pipeline end-to-end.

| Metric | Value |
|--------|-------|
| Task detected | Classification |
| Key quality issues | Missing values in `bmi`, class imbalance in `stroke` |
| Cleaning applied | Fill missing median, drop duplicates |
| Recommended models | Logistic Regression, Random Forest, XGBoost, CatBoost, SVM |

### 🚢 Titanic Dataset

A classic survival prediction dataset used to verify profiling, cleaning, and ML advice outputs.

| Metric | Value |
|--------|-------|
| Task detected | Classification |
| Key quality issues | Missing values in `Age`, `Cabin`, high cardinality in `Name` |
| Cleaning applied | Fill missing mode, drop column |
| Recommended models | Logistic Regression, Random Forest, XGBoost, CatBoost, SVM |

---

## ⚙️ How It Works

### Pipeline Flow

```
User uploads CSV/XLSX
        │
        ▼
  [API Gateway]
        │
        ├──► [Profiling Service]   → Dataset statistics, missing values, outliers, correlations
        │
        ├──► [Planner Service]     → LLM generates structured JSON cleaning plan (OpenRouter)
        │
        ├──► [Cleaning Service]    → Applies only allow-listed deterministic actions
        │
        ├──► [Visualization Service] → Generates matplotlib/seaborn charts
        │
        ├──► [ML Advisor Service]  → Detects task type, recommends models
        │
        └──► [Report Service]      → Produces HTML + PDF report (ReportLab)
```

### Security Model

- API keys remain server-side in `.env`, never exposed to the frontend
- LLM returns **structured JSON only** — it never writes or modifies data
- Cleaning service enforces an **allow-list** of safe actions:
  `drop_duplicates`, `fill_missing_mean/median/mode`, `remove_outliers_iqr`, `drop_column`, `rename_column`, `convert_type`
- File extensions validated at upload (`.csv` and `.xlsx` only)
- CORS configurable via environment variable

---

## 🏗️ Architecture

### Services

| Service | Port | Responsibility |
|---------|------|----------------|
| `apps/web` | 3000 | Next.js 15 dashboard (TypeScript + Tailwind) |
| `apps/api-gateway` | 8000 | Upload, orchestration, status, report, download |
| `services/planner-service` | — | OpenRouter LLM plan generation with fallback |
| `services/profiling-service` | — | Deterministic dataset profiling |
| `services/cleaning-service` | — | Allow-listed safe cleaning operations |
| `services/visualization-service` | — | Chart generation (matplotlib + seaborn) |
| `services/ml-advisor-service` | — | Task detection and model recommendations |
| `services/report-service` | — | HTML + PDF report generation |

### Tech Stack

**Frontend**
- Next.js 15, TypeScript, TailwindCSS
- React Query-ready patterns, Zustand state architecture
- Light/dark theme with CSS custom properties

**Backend**
- FastAPI microservices (Python 3.12)
- pandas, numpy, scipy, scikit-learn, matplotlib, seaborn
- ReportLab for PDF generation
- httpx for async inter-service communication

**Infrastructure**
- Docker Compose (fully containerized)
- Shared volume for file storage
- OpenRouter API for LLM planning (with deterministic fallback)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- (Optional) OpenRouter API key for LLM-powered planning

### 1. Clone and configure

```bash
git clone https://github.com/Ayoub-Elkhaiari/AI_Data_Science_Agent.git
cd AI_Data_Science_Agent
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key (optional — the platform works without it using the deterministic fallback):

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
CORS_ORIGINS=http://localhost:3000
```

### 2. Run

```bash
docker compose up
```

Open **http://localhost:3000** and upload a `.csv` or `.xlsx` file.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Multipart file upload (`.csv`, `.xlsx`) |
| `POST` | `/analyze` | Run full pipeline `{ "analysis_id": "..." }` |
| `GET` | `/analysis/{id}` | Returns full analysis JSON |
| `GET` | `/report/{id}` | Returns HTML report |
| `GET` | `/chart/{id}/{filename}` | Returns generated chart image |
| `GET` | `/download/{id}` | Downloads cleaned CSV |

---

## 🧠 ML Advisor

Task detection is automatic based on the target column type:

| Target Column Type | Detected Task | Recommended Models |
|--------------------|---------------|--------------------|
| Numeric | Regression | Random Forest, XGBoost, LightGBM, CatBoost, Linear Regression |
| Categorical | Classification | Logistic Regression, Random Forest, XGBoost, CatBoost, SVM |
| Not specified | Clustering | KMeans, DBSCAN, HDBSCAN |

---

## 📁 Project Structure

```
AI_Data_Science_Agent/
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   └── api-gateway/          # FastAPI orchestrator
├── services/
│   ├── planner-service/      # LLM plan generation
│   ├── profiling-service/    # Dataset profiling
│   ├── cleaning-service/     # Deterministic cleaning
│   ├── visualization-service/# Chart generation
│   ├── ml-advisor-service/   # ML recommendations
│   └── report-service/       # HTML/PDF reports
├── shared/
│   ├── schemas/models.py     # Pydantic shared models
│   └── utils/data.py         # Dataset read/write utilities
├── docker/
│   └── requirements.txt      # Shared Python dependencies
├── examples/
│   └── sample_customers.csv  # Sample dataset to get started
├── docker-compose.yml
└── .env.example
```

---

## 🎯 Why This Project Matters

Most production ML workflows suffer from one of two failure modes: too manual (an analyst runs everything by hand) or too risky (an LLM modifies the data directly with no guardrails).

This platform demonstrates a third path — using LLMs strictly as reasoning engines while keeping data operations in deterministic, auditable Python services. The result is a system that is:

- ✅ **Safe** — LLMs never touch the data
- ✅ **Reproducible** — same input always produces the same cleaning output
- ✅ **Explainable** — every action is logged in a lineage trail
- ✅ **Scalable** — each service deploys and scales independently

---

## 👤 Author

**Ayoub El Khaiari**
MSc in Advanced Machine Learning & Multimedia Intelligence

[![GitHub](https://img.shields.io/badge/GitHub-Ayoub--Elkhaiari-181717?logo=github&logoColor=white)](https://github.com/Ayoub-Elkhaiari)
