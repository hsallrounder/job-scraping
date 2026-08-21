require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 8080;
// Target Python Scraper Microservice URL (Local simulation or Render production URL)
const FASTAPI_URL = process.env.FASTAPI_URL;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

const BACKEND_ROOT = __dirname;
const PROJECT_ROOT = path.join(BACKEND_ROOT, '..');
const CONFIG_FILE_PATH = path.join(BACKEND_ROOT, 'config.json');
const OUTPUT_CSV_PATH = path.join(BACKEND_ROOT, 'output', 'jobs.csv');
const OUTPUT_JSON_PATH = path.join(BACKEND_ROOT, 'output', 'jobs.json');

// Store reference to active HTTP proxy request
let activeHttpRequest = null;

// Helper to parse CSV into JSON objects array using PapaParse
const parseCsvToJson = (csvPath) => {
  if (!fs.existsSync(csvPath)) return [];
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false
    });
    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('PapaParse warnings:', parsed.errors);
    }
    return parsed.data || [];
  } catch (err) {
    console.error('Error parsing CSV with PapaParse:', err);
    return [];
  }
};

// Master helper to get scraped jobs directly from JSON backup or CSV fallback
const getScrapedJobsData = () => {
  if (fs.existsSync(OUTPUT_JSON_PATH)) {
    try {
      const data = fs.readFileSync(OUTPUT_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Could not parse jobs.json, falling back to CSV parser:', e.message);
    }
  }
  return parseCsvToJson(OUTPUT_CSV_PATH);
};

// Helper to check if remote/local FastAPI service is alive
const checkFastApiHealth = () => {
  return new Promise((resolve) => {
    try {
      const targetUrl = new URL(`${FASTAPI_URL}/health`);
      const httpModule = targetUrl.protocol === 'https:' ? https : http;
      const req = httpModule.get(targetUrl.href, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
};

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const fastapiAlive = await checkFastApiHealth();
  const cachedJobs = getScrapedJobsData();
  res.json({
    status: 'ok',
    message: 'Express Gateway Web Server is running.',
    fastapi: {
      url: FASTAPI_URL,
      connected: fastapiAlive
    },
    hasJobs: cachedJobs.length > 0,
    totalJobs: cachedJobs.length,
    isScrapingActive: activeHttpRequest !== null
  });
});

// GET /api/jobs - Return JSON list of scraped jobs
app.get('/api/jobs', (req, res) => {
  const jobs = getScrapedJobsData();
  return res.json({
    status: 'success',
    total_jobs: jobs.length,
    jobs: jobs
  });
});

// GET /api/download-csv - Download Scraped CSV File
app.get(['/api/download-csv', '/api/download'], (req, res) => {
  if (fs.existsSync(OUTPUT_CSV_PATH)) {
    console.log(`📥 Serving CSV download: ${OUTPUT_CSV_PATH}`);
    return res.download(OUTPUT_CSV_PATH, 'scraped_jobs.csv');
  } else {
    return res.status(404).json({
      error: 'CSV results file not found. Please start a scraping job first.'
    });
  }
});

// POST /api/stop - Abort Active Scraping Request
app.post(['/api/stop', '/api/scrape/stop'], (req, res) => {
  let stopped = false;

  if (activeHttpRequest) {
    console.log('⏹️ Aborting active FastAPI proxy request.');
    try {
      activeHttpRequest.destroy();
    } catch (e) {}
    activeHttpRequest = null;
    stopped = true;
  }

  return res.json({
    status: stopped ? 'stopped' : 'idle',
    message: stopped ? 'Scraping process stopped by user.' : 'No active scraping process to stop.'
  });
});

// POST /api/scrape - Main Scraper Execution Proxy (communicates with Render FASTAPI_URL)
app.post('/api/scrape', async (req, res) => {
  try {
    const {
      roles = [],
      sites = [],
      countries = [],
      location,
      country_indeed,
      jobs_per_role = 5,
      hours_old = 24,
      remove_duplicates = true,
      job_type = null,
      is_remote = null,
      distance = 50,
      easy_apply = null,
      description_format = 'markdown',
      enforce_annual_salary = false,
      offset = 0,
      proxies = null
    } = req.body;

    const countryList = (Array.isArray(countries) && countries.length > 0)
      ? countries
      : (country_indeed ? [country_indeed] : (location ? [location] : ['India']));

    const primaryLocation = countryList[0] || 'India';

    const finalConfig = {
      roles: Array.isArray(roles)
        ? roles.map((role) => ({
            search_term: (role.search_term || '').trim(),
            google_search_term: (role.google_search_term || '').trim()
          }))
        : [],
      sites: Array.isArray(sites) && sites.length > 0 ? sites : ['indeed', 'linkedin'],

      countries: countryList,
      location: primaryLocation,
      country_indeed: primaryLocation,
      jobs_per_role: Number(jobs_per_role) || 5,
      hours_old: hours_old !== undefined && hours_old !== null ? Number(hours_old) : 24,
      fetch_linkedin_description: true,
      remove_duplicates: Boolean(remove_duplicates),
      job_type: job_type || null,
      is_remote: is_remote !== null && is_remote !== undefined ? Boolean(is_remote) : null,
      distance: Number(distance) || 50,
      easy_apply: easy_apply !== null && easy_apply !== undefined ? Boolean(easy_apply) : null,
      description_format: description_format || 'markdown',
      enforce_annual_salary: Boolean(enforce_annual_salary),
      offset: Number(offset) || 0,
      proxies: proxies || null
    };


    console.log('\n==================================================');
    console.log(`🌐 Proxying Scrape Request to Scraper Microservice (${FASTAPI_URL})`);
    console.log(JSON.stringify(finalConfig, null, 2));
    console.log('==================================================\n');

    // Save config backup
    try {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(finalConfig, null, 2), 'utf-8');
    } catch (e) {}

    // Set SSE streaming headers for React client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const sendEvent = (eventData) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      }
    };

    const targetUrl = new URL(`${FASTAPI_URL}/api/v1/scrape/stream`);
    const httpModule = targetUrl.protocol === 'https:' ? https : http;

    const payloadString = JSON.stringify(finalConfig);

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    };

    const proxyReq = httpModule.request(options, (fastapiRes) => {
      activeHttpRequest = proxyReq;
      let rawDataBuffer = '';

      fastapiRes.on('data', (chunk) => {
        if (!res.writableEnded) {
          res.write(chunk);
        }
        rawDataBuffer += chunk.toString();
      });

      fastapiRes.on('end', () => {
        activeHttpRequest = null;

        // Try parsing returned jobs payload to cache locally
        try {
          const lines = rawDataBuffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.slice(5).trim();
              if (jsonStr) {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'done' && Array.isArray(parsed.jobs) && parsed.jobs.length > 0) {
                  const outputDir = path.join(BACKEND_ROOT, 'output');
                  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
                  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(parsed.jobs, null, 2), 'utf-8');
                  
                  // Also write CSV backup
                  const papaCsv = Papa.unparse(parsed.jobs);
                  fs.writeFileSync(OUTPUT_CSV_PATH, papaCsv, 'utf-8');
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not cache output files:', e.message);
        }

        if (!res.writableEnded) {
          res.end();
        }
      });
    });

    proxyReq.on('error', (err) => {
      console.error('❌ Scraper Microservice API Error:', err.message);
      activeHttpRequest = null;
      sendEvent({
        type: 'error',
        text: `Scraper Microservice API Error: ${err.message}`
      });
      sendEvent({
        type: 'done',
        code: 1,
        jobs: [],
        message: `Failed to reach Python scraper service at ${FASTAPI_URL}. Ensure scraper-service app.py is running!`
      });
      res.end();
    });

    proxyReq.write(payloadString);
    proxyReq.end();
    activeHttpRequest = proxyReq;

  } catch (err) {
    console.error('❌ Express Gateway error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

// Serve React frontend static files in production mode
const FRONTEND_BUILD_PATH = path.join(PROJECT_ROOT, 'frontend', 'build');
if (fs.existsSync(FRONTEND_BUILD_PATH)) {
  app.use(express.static(FRONTEND_BUILD_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Express Gateway Running on http://localhost:${PORT}`);
  console.log(`📡 Connected Python Scraper API URL: ${FASTAPI_URL}`);
  console.log(`==================================================\n`);
});
