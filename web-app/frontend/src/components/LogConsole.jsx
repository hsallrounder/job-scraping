import React, { useRef, useEffect, useState } from 'react';
import './LogConsole.css';

const LogConsole = ({ logs, isScraping, onClearLogs }) => {
  const consoleEndRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom of log stream
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const fullLogText = logs.map((l) => l.text).join('');
    navigator.clipboard.writeText(fullLogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="log-console-container">
      <div className="console-header">
        <div className="header-left">
          <span className="console-title">📺 Live Terminal Console</span>
          <span className={`status-pill ${isScraping ? 'running' : 'idle'}`}>
            {isScraping ? '● LIVE SCRAPING IN PROGRESS' : '✓ IDLE / READY'}
          </span>
        </div>

        <div className="header-actions">
          <button type="button" className="console-btn" onClick={handleCopyLogs} title="Copy Logs">
            {copied ? '✓ Copied' : '📋 Copy Logs'}
          </button>
          <button type="button" className="console-btn" onClick={onClearLogs} title="Clear Logs">
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="console-body">
        {logs.length === 0 ? (
          <div className="console-placeholder">
            <span>Terminal output from <code>scraper.py</code> will appear here in real-time after clicking <strong>Start Scraping</strong>...</span>
          </div>
        ) : (
          logs.map((log, index) => {
            let itemClass = 'log-line';
            if (log.type === 'stderr' || log.type === 'error') itemClass += ' line-error';
            if (log.type === 'warning') itemClass += ' line-warning';
            if (log.type === 'info') itemClass += ' line-info';
            if (log.type === 'done') itemClass += ' line-done';

            return (
              <div key={index} className={itemClass}>
                <span className="line-prefix">&gt;</span>
                <span className="line-text">{log.text}</span>
              </div>
            );
          })
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default LogConsole;
