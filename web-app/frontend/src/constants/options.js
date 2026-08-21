export const AVAILABLE_SITES = [
  { id: "indeed", name: "Indeed", description: "Global job aggregator", disabled: false },
  { id: "linkedin", name: "LinkedIn", description: "Professional networking platform", disabled: false },
  { id: "google", name: "Google Jobs", description: "Aggregated Google search job listings", disabled: true, comingSoon: true },
];


export const AVAILABLE_COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Saudi Arabia",
  "Netherlands",
  "Ireland",
  "Spain",
  "Italy",
  "Switzerland",
  "Sweden",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Argentina",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bulgaria",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "Greece",
  "Hong Kong",
  "Hungary",
  "Indonesia",
  "Israel",
  "Kuwait",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Morocco",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "Uruguay",
  "Venezuela",
  "Vietnam",
  "Worldwide"
];

export const HOURS_OLD_OPTIONS = [
  { value: 0, label: "Any Time (No filter)" },
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

export const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Job Types" },
  { value: "fulltime", label: "Full-Time" },
  { value: "parttime", label: "Part-Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" }
];

export const DESCRIPTION_FORMAT_OPTIONS = [
  { value: "markdown", label: "Markdown (Recommended)" },
  { value: "html", label: "HTML" }
];

export const MIN_JOBS_PER_ROLE = 1;
export const MAX_JOBS_PER_ROLE = 1000;

export const INITIAL_CONFIG = {
  sites: ["indeed", "linkedin"],

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
  remove_duplicates: true,
  job_type: "",
  is_remote: false,
  distance: 50,
  description_format: "markdown"
};


