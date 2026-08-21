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
DEFAULT_SITES = ["indeed", "linkedin"]

DEFAULT_COUNTRIES = ["India"]
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
    """
    Executes multi-portal job scraping using python-jobspy based on parameters
    and specifications documented in jobspy.md.
    """
    def log(msg):
        try:
            print(msg)
        except Exception:
            try:
                print(str(msg).encode("ascii", "replace").decode("ascii"))
            except Exception:
                pass
        if log_callback:
            try:
                log_callback(str(msg))
            except Exception:
                pass


    # If no config passed, automatically load from config.json
    if config is None:
        config = load_json_config()

    roles = config.get("roles", DEFAULT_ROLES)
    sites = config.get("sites", DEFAULT_SITES)
    
    # Countries and locations support
    countries = config.get("countries", [])
    if not countries and config.get("country_indeed"):
        countries = [config.get("country_indeed")]
    elif not countries and config.get("location"):
        countries = [config.get("location")]
    if not countries:
        countries = DEFAULT_COUNTRIES

    jobs_per_role = config.get("jobs_per_role", DEFAULT_JOBS_PER_ROLE)
    hours_old = config.get("hours_old", DEFAULT_HOURS_OLD)
    fetch_linkedin_desc = config.get(
        "fetch_linkedin_description", DEFAULT_FETCH_LINKEDIN_DESC
    )
    
    # Extended parameters supported in jobspy.md
    job_type = config.get("job_type", None)
    is_remote = config.get("is_remote", False)
    distance = config.get("distance", 50)
    easy_apply = config.get("easy_apply", None)
    description_format = config.get("description_format", "markdown")
    enforce_annual_salary = config.get("enforce_annual_salary", False)
    offset = config.get("offset", 0)
    proxies = config.get("proxies", None)
    ca_cert = config.get("ca_cert", None)
    user_agent = config.get("user_agent", None)
    verbose = config.get("verbose", 0)
    linkedin_company_ids = config.get("linkedin_company_ids", None)

    all_jobs = []

    # Map sites to standardized aliases if needed
    cleaned_sites = []
    for s in sites:
        s_lower = str(s).lower().strip()
        if s_lower == "ziprecruiter":
            cleaned_sites.append("zip_recruiter")
        else:
            cleaned_sites.append(s_lower)

    for role in roles:
        search_term = role.get("search_term", "").strip()
        google_search_term = role.get("google_search_term", "").strip()

        if not search_term and not google_search_term:
            continue

        effective_search_term = search_term if search_term else google_search_term

        for country in countries:
            loc_label = f" in {country}" if country else ""
            log("=" * 70)
            log(f"Searching for: '{effective_search_term}'{loc_label} across {', '.join(cleaned_sites)}")
            log("=" * 70)

            try:
                # Build scrape_jobs kwargs
                scrape_kwargs = {
                    "site_name": cleaned_sites,
                    "search_term": effective_search_term,
                    "location": country,
                    "country_indeed": country,
                    "results_wanted": jobs_per_role,
                    "hours_old": hours_old if hours_old else None,
                    "linkedin_fetch_description": fetch_linkedin_desc,
                    "description_format": description_format,
                    "enforce_annual_salary": enforce_annual_salary,
                }


                if google_search_term and "google" in cleaned_sites:
                    scrape_kwargs["google_search_term"] = google_search_term

                if job_type:
                    scrape_kwargs["job_type"] = job_type
                if is_remote is not None:
                    scrape_kwargs["is_remote"] = bool(is_remote)
                if distance:
                    scrape_kwargs["distance"] = int(distance)
                if easy_apply is not None:
                    scrape_kwargs["easy_apply"] = bool(easy_apply)
                if offset:
                    scrape_kwargs["offset"] = int(offset)
                if proxies:
                    scrape_kwargs["proxies"] = proxies
                if ca_cert:
                    scrape_kwargs["ca_cert"] = ca_cert
                if user_agent:
                    scrape_kwargs["user_agent"] = user_agent
                if verbose is not None:
                    scrape_kwargs["verbose"] = int(verbose)
                if linkedin_company_ids:
                    scrape_kwargs["linkedin_company_ids"] = linkedin_company_ids

                jobs = scrape_jobs(**scrape_kwargs)

                if jobs is None or jobs.empty:
                    log(f"No jobs found for '{search_term}' in {country}\n")
                    continue

                jobs = jobs.head(jobs_per_role).copy()
                jobs["searched_role"] = search_term
                if "country" not in jobs.columns and country:
                    jobs["country"] = country

                log(f"Found & kept {len(jobs)} jobs for '{search_term}' ({country})\n")
                all_jobs.append(jobs)

            except Exception as e:
                log(f"Error searching '{search_term}' ({country}): {e}\n")

    if len(all_jobs) == 0:
        log("No jobs collected across all roles and locations.")
        return pd.DataFrame()

    final_jobs = pd.concat(
        all_jobs,
        ignore_index=True,
    )

    log("=" * 70)
    log(f"🎉 Total jobs collected: {len(final_jobs)}")
    log("=" * 70)
    return final_jobs

