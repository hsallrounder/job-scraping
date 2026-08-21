import React, { useState, useEffect } from 'react';
import SiteMultiSelect from './SiteMultiSelect';
import RoleList from './RoleList';
import CountryMultiSelect from './CountryMultiSelect';
import ScrapingOptions from './ScrapingOptions';
import StartScrapingButton from './StartScrapingButton';
import LogConsole from './LogConsole';
import JobResultsTable from './JobResultsTable';
import { INITIAL_CONFIG } from '../constants/options';
import { API_ENDPOINTS } from '../config/api';
import './ScraperConfigPage.css';

const ScraperConfigPage = () => {
  // Main Configuration State
  const [sites, setSites] = useState(INITIAL_CONFIG.sites);
  const [roles, setRoles] = useState(INITIAL_CONFIG.roles);
  const [countries, setCountries] = useState(INITIAL_CONFIG.countries);
  const [jobsPerRole, setJobsPerRole] = useState(INITIAL_CONFIG.jobs_per_role);
  const [hoursOldIndeed, setHoursOldIndeed] = useState(INITIAL_CONFIG.hours_old_indeed ?? 24);
  const [hoursOldLinkedin, setHoursOldLinkedin] = useState(INITIAL_CONFIG.hours_old_linkedin ?? 24);
  const [removeDuplicates, setRemoveDuplicates] = useState(INITIAL_CONFIG.remove_duplicates);
  const [jobType, setJobType] = useState(INITIAL_CONFIG.job_type || '');
  const [isRemote, setIsRemote] = useState(INITIAL_CONFIG.is_remote || false);
  const [fetchLinkedinDescription, setFetchLinkedinDescription] = useState(INITIAL_CONFIG.fetch_linkedin_description ?? true);
  const [descriptionFormat, setDescriptionFormat] = useState(INITIAL_CONFIG.description_format || 'markdown');



  // Status, Scraped Data & Logs State
  const [apiStatus, setApiStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error' | 'stopped'
  const [hasCsvResults, setHasCsvResults] = useState(false);
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const isGoogleSelected = sites.includes('google');
  const hasOtherSites = sites.some((site) => site !== 'google');
  const isSubmitting = apiStatus === 'sending';

  // Check backend health and fetch existing jobs on mount
  useEffect(() => {
    fetch(API_ENDPOINTS.HEALTH)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.hasJobs || data.totalJobs > 0)) {
          setHasCsvResults(true);
          fetch(API_ENDPOINTS.JOBS)
            .then((res) => res.json())
            .then((jobsData) => {
              if (jobsData && Array.isArray(jobsData.jobs) && jobsData.jobs.length > 0) {
                setScrapedJobs(jobsData.jobs);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Backend offline
      });
  }, []);

  // Role management handlers
  const handleAddRole = () => {
    if (isSubmitting) return;
    const newRole = {
      id: `role_${Date.now()}`,
      search_term: '',
      google_search_term: ''
    };
    setRoles([...roles, newRole]);
  };

  const handleRoleChange = (roleId, field, value) => {
    if (isSubmitting) return;
    setRoles(
      roles.map((r) => (r.id === roleId ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRole = (roleId) => {
    if (isSubmitting) return;
    setRoles(roles.filter((r) => r.id !== roleId));
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Construct Clean Payload Object matching jobspy.md specifications
  const buildPayload = () => {
    return {
      roles: roles.map((r) => {
        const roleObj = { search_term: (r.search_term || '').trim() };
        if (isGoogleSelected || r.google_search_term) {
          roleObj.google_search_term = (r.google_search_term || '').trim();
        }
        return roleObj;
      }),
      sites: sites,
      countries: countries,
      location: countries && countries.length > 0 ? countries[0] : 'India',
      country_indeed: countries && countries.length > 0 ? countries[0] : 'India',
      jobs_per_role: Number(jobsPerRole) || 5,
      hours_old_indeed: (jobType || isRemote) ? 0 : (Number(hoursOldIndeed) || 0),
      hours_old_linkedin: Number(hoursOldLinkedin) || 0,
      hours_old: (jobType || isRemote) ? 0 : (Number(hoursOldIndeed) || Number(hoursOldLinkedin) || 0),
      remove_duplicates: Boolean(removeDuplicates),
      job_type: jobType || null,
      is_remote: Boolean(isRemote),
      fetch_linkedin_description: Boolean(fetchLinkedinDescription),
      description_format: descriptionFormat || 'markdown'
    };




  };

  // DIRECT SSE STREAMING DISPATCH WITH CLEAN LOGS & IMMEDIATE CSV BUTTON HIDE
  const handleStartScrapingDirect = async () => {
    if (isSubmitting) return;

    // IMMEDIATELY HIDE OLD CSV DOWNLOAD BUTTON & RESET CSV/JOBS AVAILABILITY
    setHasCsvResults(false);
    setScrapedJobs([]);
    setApiStatus('sending');
    setStatusMessage('Scraping initiated! Real-time logs are streaming below...');
    setLogs([]); // Clear logs for new run

    try {
      const payload = buildPayload();
      const apiUrl = API_ENDPOINTS.SCRAPE;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep partial trailing line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;
              const eventData = JSON.parse(jsonStr);

              if (eventData.text) {
                const txt = String(eventData.text);
                if (!txt.includes('Master CSV Saved Successfully') && !txt.includes('Location :')) {
                  setLogs((prev) => [...prev, { type: eventData.type, text: eventData.text }]);
                }
              }

              if (eventData.type === 'done') {
                if (Array.isArray(eventData.jobs) && eventData.jobs.length > 0) {
                  setScrapedJobs(eventData.jobs);
                }
                if (eventData.code === 0 && (eventData.hasCsv || (eventData.jobs && eventData.jobs.length > 0))) {
                  setApiStatus('success');
                  setHasCsvResults(true);
                  setStatusMessage(`🎉 Scraping completed! Collected ${eventData.total_jobs || (eventData.jobs ? eventData.jobs.length : 0)} jobs.`);
                } else {
                  setApiStatus(eventData.code === 0 ? 'success' : 'error');
                  setHasCsvResults(Boolean(eventData.hasCsv));
                  setStatusMessage(eventData.message || 'Scraping process finished.');
                }
              }
            } catch (parseErr) {
              console.error('SSE JSON parse error:', parseErr);
            }
          }
        }
      }
    } catch (err) {
      if (apiStatus !== 'stopped') {
        setApiStatus('error');
        setStatusMessage('Network error: Could not reach Express REST API server.');
        setLogs((prev) => [
          ...prev,
          { type: 'error', text: `❌ Network Connection Error: ${err.message}` }
        ]);
      }
    }
  };

  // STOP SCRAPER HANDLER
  const handleStopScraping = async () => {
    try {
      setApiStatus('stopped');
      setHasCsvResults(false);
      setStatusMessage('⏹️ Stopping active scraper process...');

      setLogs((prev) => [
        ...prev,
        { type: 'warning', text: '⏹️ Scraping process stopped by user.' }
      ]);

      const stopUrl = API_ENDPOINTS.STOP;
      await fetch(stopUrl, { method: 'POST' });
    } catch (err) {
      console.error('Error stopping scraper:', err);
    }
  };

  // Download CSV Results Handler
  const handleDownloadCsv = async () => {
    try {
      const downloadUrl = API_ENDPOINTS.DOWNLOAD_CSV;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        alert('CSV file not found on backend. Please run scraping first.');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scraped_jobs.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download CSV. Make sure Express backend is running.');
    }
  };

  return (
    <div className="scraper-config-page">
      {/* Top Header Banner */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-icon-box">
              <span className="brand-logo">🔎</span>
            </div>
            <div>
              <h1 className="app-title">Job Scraper Intelligence Platform</h1>
              <p className="app-subtitle">
                Multi-Portal Analytics Engine • FastAPI Scraper & Express Gateway
              </p>
            </div>
          </div>
          <div className="header-badges">
            <div className="header-badge live-badge">
              <span className="pulse-dot"></span> Online
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="form-container">
        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`status-notification-banner ${apiStatus}`}>
            <span className="status-text">{statusMessage}</span>
          </div>
        )}

        {/* Configuration Container with Loader Overlay */}
        <div className="config-sections-wrapper">
          {isSubmitting && (
            <div className="scraping-active-overlay">
              <div className="loader-box">
                <div className="spinner"></div>
                <div className="loader-text">
                  <h3>Scraping in Progress...</h3>
                  <p>Configuration changes are locked while scraping is in progress.</p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Job Sites */}
          <SiteMultiSelect
            selectedSites={sites}
            onChange={setSites}
            disabled={isSubmitting}
          />

          {/* 2 & 3. Roles and Conditional Google Search Terms */}
          <RoleList
            roles={roles}
            isGoogleSelected={isGoogleSelected}
            hasOtherSites={hasOtherSites}
            onAddRole={handleAddRole}
            onRoleChange={handleRoleChange}
            onRemoveRole={handleRemoveRole}
            disabled={isSubmitting}
          />


          {/* 4. Location / Countries */}
          <CountryMultiSelect
            selectedCountries={countries}
            onChange={setCountries}
            disabled={isSubmitting}
          />

          {/* 4. Scraping Options & Advanced Filters */}
          <ScrapingOptions
            sites={sites}
            jobsPerRole={jobsPerRole}
            descriptionFormat={descriptionFormat}
            removeDuplicates={removeDuplicates}
            hoursOldIndeed={hoursOldIndeed}
            jobType={jobType}
            isRemote={isRemote}
            hoursOldLinkedin={hoursOldLinkedin}
            fetchLinkedinDescription={fetchLinkedinDescription}
            onJobsPerRoleChange={setJobsPerRole}
            onDescriptionFormatChange={setDescriptionFormat}
            onRemoveDuplicatesChange={setRemoveDuplicates}
            onHoursOldIndeedChange={setHoursOldIndeed}
            onJobTypeChange={setJobType}
            onIsRemoteChange={setIsRemote}
            onHoursOldLinkedinChange={setHoursOldLinkedin}
            onFetchLinkedinDescriptionChange={setFetchLinkedinDescription}
            disabled={isSubmitting}
          />




        </div>

        {/* Start Scraping & Stop Controls */}
        <StartScrapingButton
          onStartScraping={handleStartScrapingDirect}
          onStopScraping={handleStopScraping}
          isSubmitting={isSubmitting}
          status={apiStatus}
          hasCsvResults={hasCsvResults}
          onDownloadCsv={handleDownloadCsv}
        />

        {/* Live Terminal Log Console */}
        <LogConsole
          logs={logs}
          isScraping={isSubmitting}
          onClearLogs={handleClearLogs}
        />

        {/* Scraped Job Results Table & CSV Export */}
        <JobResultsTable jobs={scrapedJobs} />
      </main>
    </div>
  );
};

export default ScraperConfigPage;
