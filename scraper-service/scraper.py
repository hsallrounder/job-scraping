import json
import os
import pandas as pd
from jobspy import scrape_jobs

DEFAULT_ROLES = [
    {
        "search_term": "Associate Software Engineer",
        "google_search_term": "Fresher OR Entry Level 'Associate Software Engineer' job in India"
    }
]
DEFAULT_SITES = ["indeed", "linkedin", "google"]
DEFAULT_LOCATION = "India"
DEFAULT_COUNTRY_INDEED = "India"
DEFAULT_JOBS_PER_ROLE = 5
DEFAULT_HOURS_OLD = 24
DEFAULT_FETCH_LINKEDIN_DESC = True


def load_json_config():
    """Attempt to load config.json if available."""
    config_file = os.path.join(os.path.dirname(__file__), "config.json")
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as file:
                return json.load(file)
        except Exception as e:
            print(f"Warning: Could not load config.json ({e}). Using default settings.")
    return {}


def scrape_all_jobs(config=None, log_callback=None):

    def log(msg):
        print(msg)
        if log_callback:
            log_callback(msg)

    # If no config passed, automatically load from config.json
    if config is None:
        config = load_json_config()

    roles = config.get("roles", DEFAULT_ROLES)
    sites = config.get("sites", DEFAULT_SITES)
    location = config.get("location", DEFAULT_LOCATION)
    country_indeed = config.get("country_indeed", DEFAULT_COUNTRY_INDEED)
    jobs_per_role = config.get("jobs_per_role", DEFAULT_JOBS_PER_ROLE)
    hours_old = config.get("hours_old", DEFAULT_HOURS_OLD)
    fetch_linkedin_desc = config.get(
        "fetch_linkedin_description", DEFAULT_FETCH_LINKEDIN_DESC
    )

    all_jobs = []

    for role in roles:
        search_term = role.get("search_term", "")
        google_search_term = role.get("google_search_term", "")

        log("=" * 70)
        log(f"Searching for: {search_term}")
        log("=" * 70)

        try:
            jobs = scrape_jobs(
                site_name=sites,
                search_term=search_term,
                google_search_term=google_search_term if google_search_term else None,
                location=location,
                results_wanted=jobs_per_role,
                hours_old=hours_old,
                country_indeed=country_indeed,
                linkedin_fetch_description=fetch_linkedin_desc,
            )

            if jobs.empty:
                log("No jobs found\n")
                continue

            jobs = jobs.head(jobs_per_role).copy()
            jobs["searched_role"] = search_term

            log(f"Keeping {len(jobs)} jobs\n")
            all_jobs.append(jobs)

        except Exception as e:
            log(f"Error searching {search_term}: {e}")

    if len(all_jobs) == 0:
        log("No jobs collected across all roles.")
        return pd.DataFrame()

    final_jobs = pd.concat(
        all_jobs,
        ignore_index=True,
    )

    log(f"Total collected: {len(final_jobs)}")
    return final_jobs
