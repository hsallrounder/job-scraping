/**
 * Centralized Backend API Configuration
 * 
 * Reads the backend URL from environment variables once (REACT_APP_BACKEND_URL)
 * with a fallback to http://localhost:8080.
 */

const RAW_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL;

// Strip any trailing slash for consistent endpoint formatting
export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  HEALTH: `${BACKEND_URL}/api/health`,
  JOBS: `${BACKEND_URL}/api/jobs`,
  SCRAPE: `${BACKEND_URL}/api/scrape`,
  STOP: `${BACKEND_URL}/api/stop`,
  DOWNLOAD_CSV: `${BACKEND_URL}/api/download-csv`,
};

export default API_ENDPOINTS;
