export const AVAILABLE_SITES = [
  { id: "indeed", name: "Indeed", description: "Global job aggregator" },
  { id: "linkedin", name: "LinkedIn", description: "Professional networking platform" },
  { id: "google", name: "Google Jobs", description: "Google search job listings (Requires Google Search Terms)" },
  { id: "zip_recruiter", name: "ZipRecruiter", description: "Job search and hiring platform" },
  { id: "glassdoor", name: "Glassdoor", description: "Company reviews & job listings" },
  { id: "bayt", name: "Bayt", description: "Middle East job portal" },
];

export const AVAILABLE_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Netherlands",
  "Spain",
  "Italy",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "South Africa",
  "Saudi Arabia",
  "New Zealand",
  "Ireland",
  "Switzerland",
  "Sweden"
];

export const HOURS_OLD_OPTIONS = [
  { value: 12, label: "Last 12 hours" },
  { value: 24, label: "Last 24 hours (1 day)" },
  { value: 36, label: "Last 36 hours" },
  { value: 48, label: "Last 48 hours (2 days)" },
  { value: 72, label: "Last 72 hours (3 days)" },
  { value: 96, label: "Last 96 hours (4 days)" },
  { value: 168, label: "Last 7 days (1 week)" },
  { value: 336, label: "Last 14 days (2 weeks)" },
  { value: 720, label: "Last 30 days (1 month)" }
];

export const MIN_JOBS_PER_ROLE = 1;
export const MAX_JOBS_PER_ROLE = 1000;

export const INITIAL_CONFIG = {
  sites: ["indeed", "linkedin", "google"],
  roles: [
    {
      id: "role_1",
      search_term: "Associate Software Engineer",
      google_search_term: "Fresher OR Entry Level 'Associate Software Engineer' job in India"
    }
  ],
  countries: ["India"],
  jobs_per_role: 5,
  hours_old: 24,
  remove_duplicates: true
};
