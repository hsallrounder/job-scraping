import React from 'react';
import './StartScrapingButton.css';

const StartScrapingButton = ({
  onStartScraping,
  onStopScraping,
  isSubmitting,
  status,
  hasCsvResults,
  onDownloadCsv
}) => {
  return (
    <div className="start-scraping-container">
      <div className="button-group">
        {!isSubmitting ? (
          <button
            type="button"
            className="start-scraping-btn"
            onClick={onStartScraping}
          >
            <span className="btn-icon">🚀</span>
            <span className="btn-text">Start Scraping</span>
          </button>
        ) : (
          <div className="active-scraping-controls">
            <button
              type="button"
              className="start-scraping-btn submitting"
              disabled
            >
              <span className="btn-icon spinner-icon">⏳</span>
              <span className="btn-text">Scraping in Progress...</span>
            </button>

            <button
              type="button"
              className="stop-scraping-btn"
              onClick={onStopScraping}
            >
              <span className="btn-icon">⏹️</span>
              <span className="btn-text">Stop Scraper</span>
            </button>
          </div>
        )}

        {/* Download CSV button only appears AFTER scraping completes successfully */}
        {!isSubmitting && status === 'success' && hasCsvResults && (
          <button
            type="button"
            className="download-csv-btn"
            onClick={onDownloadCsv}
          >
            <span className="btn-icon">📥</span>
            <span className="btn-text">Download CSV Results</span>
          </button>
        )}
      </div>

      {status === 'success' && hasCsvResults && (
        <p className="start-scraping-hint">
          <span className="success-status-text">
            ✅ You can now download the CSV results file.
          </span>
        </p>
      )}

      {status === 'stopped' && (
        <p className="start-scraping-hint">
          <span className="stopped-status-text">
            ⏹️ Scraping process stopped by user.
          </span>
        </p>
      )}
    </div>
  );
};

export default StartScrapingButton;
