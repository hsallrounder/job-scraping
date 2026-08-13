# 🕵️‍♂️ Job Scraper Intelligence Platform

A modern 2-tier microservices application for job scraping, real-time analytics, and dynamic web reporting.

---

## 🏗️ Repository Architecture

```text
Job Scrapping/
├── scraper-service/             # 🐍 Standalone Python FastAPI Web Microservice (Render Ready)
│   ├── app.py                   # FastAPI REST & SSE log streaming endpoints ($PORT ready)
│   ├── scraper.py               # JobSpy scraping logic & DataFrame processing
│   ├── config.json              # Central configuration file for search parameters
│   ├── requirements.txt         # Python dependencies (JobSpy, FastAPI, Pandas, Uvicorn)
│   └── runtime.txt              # Specifies Python version for Render (python-3.12.8)
│
└── web-app/                     # 🌐 Full-Stack Application (Express Gateway + React UI)
    ├── backend/                 # Express Gateway Server (Proxies requests to FASTAPI_URL)
    │   ├── server.js            # Express API server & proxy handlers
    │   ├── .env.example         # Environment configuration template
    │   ├── package.json         # Express, PapaParse & Dotenv dependencies
    │   └── nodemon.json
    └── frontend/                # React Single Page Application (SPA)
        ├── src/                 # Interactive Job Table, Log Console, & Config Form
        └── package.json
```

---

## ✨ Features

- **Real-Time Log Streaming**: Live terminal log updates streamed directly to the browser via Server-Sent Events (SSE).
- **Dynamic Interactive Table**: Multi-column sorting, searching across all 36 JobSpy fields, site-badge filtering, pagination, and an `👁️ Details` job description modal inspector.
- **RFC-4180 Compliant CSV Export**: Clean browser-side and server-side CSV downloading powered by `PapaParse`.
- **Multi-Portal Scraping**: Support for Indeed, LinkedIn, and Google Jobs.
- **Render Cloud Ready**: Fully self-contained Python microservice configured with `runtime.txt` for 1-click cloud deployment.

---

## 🚀 Quick Start (Local Simulation)

Follow these steps to run all 3 tiers locally:

### 1️⃣ Step 1: Start Python Scraper Microservice (Port 8000)

```powershell
# Open Terminal 1: Navigate to scraper-service
cd scraper-service

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI application
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
> **Scraper API running on:** `http://localhost:8000`  
> **Interactive Swagger Docs:** `http://localhost:8000/docs`

---

### 2️⃣ Step 2: Start Express Backend Gateway (Port 5000)

```powershell
# Open Terminal 2: Navigate to backend
cd web-app/backend

# Install Node dependencies
npm install

# Start Express server
npm start
```
> **Express Gateway running on:** `http://localhost:5000`  
> *(Connected by default to `http://localhost:8000`)*

---

### 3️⃣ Step 3: Start React Frontend UI (Port 3000)

```powershell
# Open Terminal 3: Navigate to frontend
cd web-app/frontend

# Install Node dependencies
npm install

# Start React development server
npm start
```
> **React App running on:** `http://localhost:3000`

---

## ☁️ Deploying Scraper Service to Render

1. Push your repository to **GitHub**.
2. Log into the [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
3. Connect your repository and configure:
   - **Root Directory**: `scraper-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Render automatically reads [`scraper-service/runtime.txt`](file:///c:/Users/raadh/OneDrive/Desktop/MyAnatomy/MATCH/Opportunity/Job%20Scrapping/scraper-service/runtime.txt) (`python-3.12.8`) to ensure Python environment compatibility.
5. Once deployed, copy your live Render URL (e.g. `https://your-scraper-service.onrender.com`).

---

## 🔌 Connecting Your Local Web App to Live Render API

Once your `scraper-service` is live on Render, you can connect your local Express backend (`web-app/backend`) to your live Render URL using **either of these 2 methods**:

### Method A: `.env` File (Recommended)
1. Create a `.env` file inside `web-app/backend/`:
   ```env
   FASTAPI_URL=https://your-scraper-service.onrender.com
   ```
2. Start your Express backend as usual:
   ```powershell
   npm start
   ```

---

### Method B: Terminal Environment Variable
Set `FASTAPI_URL` directly when starting your Express server:

**PowerShell (Windows):**
```powershell
$env:FASTAPI_URL="https://your-scraper-service.onrender.com"; npm start
```

**Bash (Mac / Linux):**
```bash
FASTAPI_URL=https://your-scraper-service.onrender.com npm start
```

---

## 📡 API Reference

### 🐍 Python Scraper Microservice (FastAPI - Port 8000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Health check endpoint |
| **POST** | `/api/v1/scrape` | Synchronous REST endpoint returning JSON array of jobs |
| **POST** | `/api/v1/scrape/stream` | SSE Streaming endpoint returning real-time log lines & final JSON output |

### 🌐 Express Backend Gateway (Node.js - Port 5000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Gateway status & FastAPI connectivity check |
| **GET** | `/api/jobs` | Returns cached JSON job results |
| **GET** | `/api/download-csv` | Downloads RFC-4180 CSV export file |
| **POST** | `/api/scrape` | Proxies UI configuration to FastAPI SSE stream |
| **POST** | `/api/stop` | Aborts active scraping request |

---

## ⚙️ Configuration (`config.json`)

All default search parameters are managed inside [`scraper-service/config.json`](file:///c:/Users/raadh/OneDrive/Desktop/MyAnatomy/MATCH/Opportunity/Job%20Scrapping/scraper-service/config.json):

```json
{
  "roles": [
    {
      "search_term": "Associate Software Engineer",
      "google_search_term": "Fresher OR Entry Level 'Associate Software Engineer' job in India"
    }
  ],
  "sites": ["indeed", "google", "linkedin"],
  "location": "India",
  "country_indeed": "India",
  "jobs_per_role": 5,
  "hours_old": 24,
  "fetch_linkedin_description": true,
  "remove_duplicates": true
}
```
