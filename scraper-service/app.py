import asyncio
import csv
import json
import os
import queue
import threading
from datetime import datetime
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from scraper import scrape_all_jobs

app = FastAPI(
    title="JobSpy Scraper Service (Render Deployment)",
    version="1.0.0",
    description="Standalone FastAPI Web Service providing JobSpy scraper API endpoints for Render.",
)

# Allow CORS for all origins (Express gateway, React frontend, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RoleItem(BaseModel):
    search_term: str
    google_search_term: Optional[str] = ""


class ScrapeRequest(BaseModel):
    roles: List[RoleItem]
    sites: List[str] = ["indeed", "linkedin"]
    location: Optional[str] = "India"
    country_indeed: Optional[str] = "India"
    jobs_per_role: Optional[int] = 5
    hours_old: Optional[int] = 24
    fetch_linkedin_description: Optional[bool] = True
    remove_duplicates: Optional[bool] = True


def process_jobs_dataframe(df: pd.DataFrame, remove_duplicates: bool = True):
    if df is None or df.empty:
        return []

    jobs_df = df.copy()
    if "scraped_date" not in jobs_df.columns:
        jobs_df["scraped_date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if remove_duplicates:
        duplicate_columns = [
            col
            for col in ["title", "company", "location"]
            if col in jobs_df.columns
        ]
        if duplicate_columns:
            jobs_df = jobs_df.drop_duplicates(subset=duplicate_columns, keep="first")

    # Use pandas to_json to robustly convert all Timestamps, numpy types, and NaNs to standard JSON primitives
    json_str = jobs_df.to_json(orient="records", date_format="iso")
    records = json.loads(json_str)

    # Save local CSV & JSON backups
    try:
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        csv_path = os.path.join(output_dir, "jobs.csv")
        json_path = os.path.join(output_dir, "jobs.json")

        jobs_df.to_csv(
            csv_path,
            quoting=csv.QUOTE_NONNUMERIC,
            escapechar="\\",
            index=False,
        )
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Warning: Could not save output backups: {e}")

    return records


@app.get("/")
def root():
    return {
        "service": "JobSpy Scraper API Microservice",
        "status": "online",
        "health": "/health",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FastAPI JobSpy Scraper Service",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/v1/scrape")
def scrape_jobs_sync(request: ScrapeRequest):
    """Synchronous REST Endpoint returning complete JSON scraped results."""
    try:
        config = request.model_dump()
        df = scrape_all_jobs(config)
        jobs_list = process_jobs_dataframe(df, remove_duplicates=request.remove_duplicates)
        return {
            "status": "success",
            "total_jobs": len(jobs_list),
            "jobs": jobs_list,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/scrape/stream")
def scrape_jobs_stream(request: ScrapeRequest):
    """SSE Streaming Endpoint yielding log lines in real-time, ending with the JSON job list."""
    log_queue = queue.Queue()

    def log_callback(message: str):
        log_queue.put({"type": "log", "text": message})

    def run_scraper_thread():
        try:
            config = request.model_dump()
            df = scrape_all_jobs(config, log_callback=log_callback)
            jobs_list = process_jobs_dataframe(df, remove_duplicates=request.remove_duplicates)
            log_queue.put({
                "type": "done",
                "code": 0,
                "total_jobs": len(jobs_list),
                "jobs": jobs_list,
                "message": "Job scraping completed successfully!"
            })
        except Exception as e:
            log_queue.put({
                "type": "error",
                "code": 1,
                "text": f"Scraping error: {str(e)}"
            })
            log_queue.put({
                "type": "done",
                "code": 1,
                "jobs": [],
                "message": f"Error: {str(e)}"
            })
        finally:
            log_queue.put(None)  # Sentinel to end stream

    threading.Thread(target=run_scraper_thread, daemon=True).start()

    def event_generator():
        while True:
            item = log_queue.get()
            if item is None:
                break
            try:
                yield f"data: {json.dumps(item, default=str)}\n\n"
            except Exception as e:
                print(f"Error encoding stream item to JSON: {e}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
