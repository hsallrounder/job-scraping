import React, { useState } from 'react';
import './PayloadModal.css';

const PayloadModal = ({ payload, onClose, onConfirm, status, apiResponse }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚀 Configuration Payload & REST API Status</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="status-banner">
            <span className="status-badge">
              {status === 'sending' && '⏳ Sending POST /api/scrape...'}
              {status === 'success' && '✅ Scraping Triggered Successfully!'}
              {status === 'error' && '⚡ Express API Ready (Endpoint: /api/scrape)'}
              {status === 'idle' && '📋 Payload Preview Ready'}
            </span>
            <p className="status-desc">
              {status === 'error'
                ? 'Express backend API is not reachable. Below is the exact REST API contract payload prepared for POST /api/scrape.'
                : 'This clean JSON configuration will be sent to the Express REST API backend.'}
            </p>
          </div>

          <div className="code-header">
            <span>JSON Payload (POST /api/scrape)</span>
            <button type="button" className="copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copied' : '📋 Copy JSON'}
            </button>
          </div>

          <pre className="json-preview">{jsonString}</pre>

          {apiResponse && (
            <div className="api-response-box">
              <span className="response-title">Backend Response:</span>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-secondary-btn" onClick={onClose}>
            Close
          </button>
          {status !== 'sending' && (
            <button className="modal-primary-btn" onClick={onConfirm}>
              ⚡ Dispatch to POST /api/scrape
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayloadModal;
