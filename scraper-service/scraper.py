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
    hours_old_indeed = config.get("hours_old_indeed", None)
    hours_old_linkedin = config.get("hours_old_linkedin", None)
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

            # Scrape each site independently to apply site-exclusive parameters precisely
            for site in cleaned_sites:
                try:
                    site_kwargs = {
                        "site_name": [site],
                        "search_term": effective_search_term,
                        "location": country,
                        "results_wanted": jobs_per_role,
                        "description_format": description_format,
                        "enforce_annual_salary": enforce_annual_salary,
                    }

                    if distance:
                        site_kwargs["distance"] = int(distance)
                    if offset:
                        site_kwargs["offset"] = int(offset)
                    if proxies:
                        site_kwargs["proxies"] = proxies
                    if ca_cert:
                        site_kwargs["ca_cert"] = ca_cert
                    if user_agent:
                        site_kwargs["user_agent"] = user_agent
                    if verbose is not None:
                        site_kwargs["verbose"] = int(verbose)

                    # Site-specific configuration routing
                    if site == "indeed":
                        site_kwargs["country_indeed"] = country
                        # Indeed mutual exclusion: job_type & is_remote disable hours_old
                        if job_type or is_remote:
                            if job_type:
                                site_kwargs["job_type"] = job_type
                            if is_remote is not None:
                                site_kwargs["is_remote"] = bool(is_remote)
                        else:
                            eff_indeed_hours = hours_old_indeed if hours_old_indeed is not None else hours_old
                            if eff_indeed_hours:
                                site_kwargs["hours_old"] = int(eff_indeed_hours)

                        if easy_apply is not None:
                            site_kwargs["easy_apply"] = bool(easy_apply)

                    elif site == "linkedin":
                        site_kwargs["linkedin_fetch_description"] = bool(fetch_linkedin_desc)
                        eff_li_hours = hours_old_linkedin if hours_old_linkedin is not None else hours_old
                        if eff_li_hours:
                            site_kwargs["hours_old"] = int(eff_li_hours)

                        if linkedin_company_ids:
                            site_kwargs["linkedin_company_ids"] = linkedin_company_ids

                    elif site == "google":
                        if google_search_term:
                            site_kwargs["google_search_term"] = google_search_term

                    log(f"[{site.upper()}] Scraping '{effective_search_term}'...")
                    jobs = scrape_jobs(**site_kwargs)

                    if jobs is None or jobs.empty:
                        log(f"[{site.upper()}] No jobs found for '{effective_search_term}' ({country})\n")
                        continue

                    jobs = jobs.head(jobs_per_role).copy()
                    jobs["searched_role"] = effective_search_term
                    if "country" not in jobs.columns and country:
                        jobs["country"] = country

                    log(f"[{site.upper()}] Found & kept {len(jobs)} jobs for '{effective_search_term}'\n")
                    all_jobs.append(jobs)

                except Exception as e:
                    log(f"[{site.upper()}] Error scraping '{effective_search_term}' in {country}: {e}\n")

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

