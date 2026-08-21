import React, { useState } from 'react';
import { AVAILABLE_SITES } from '../constants/options';
import ValidationMessage from './ValidationMessage';
import './SiteMultiSelect.css';

const SiteMultiSelect = ({ selectedSites, onChange, error, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSites = AVAILABLE_SITES.filter((site) =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSite = (siteId) => {
    if (disabled) return;
    const siteObj = AVAILABLE_SITES.find((s) => s.id === siteId);
    if (siteObj && (siteObj.disabled || siteObj.comingSoon)) return;

    if (selectedSites.includes(siteId)) {
      onChange(selectedSites.filter((id) => id !== siteId));
    } else {
      onChange([...selectedSites, siteId]);
    }
  };

  const removeSite = (siteId, e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedSites.filter((id) => id !== siteId));
  };

  const isGoogleSelected = selectedSites.includes('google');

  return (
    <div className={`section-card site-multiselect-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">🌐</span> 1. Job Sites
        </h2>
        <span className="selection-count">
          {selectedSites.length} active selected
        </span>
      </div>

      <p className="section-description">
        Choose active job portals to scrape opportunities.
      </p>

      {/* Selected Tags Display */}
      <div className="selected-tags">
        {selectedSites.map((siteId) => {
          const siteObj = AVAILABLE_SITES.find((s) => s.id === siteId);
          return (
            <span
              key={siteId}
              className={`site-tag ${siteId === 'google' ? 'tag-google' : ''}`}
            >
              {siteId === 'google' && '🔍 '}
              {siteObj ? siteObj.name : siteId}
              {!disabled && (
                <button
                  type="button"
                  className="tag-remove-btn"
                  onClick={(e) => removeSite(siteId, e)}
                  title={`Remove ${siteObj ? siteObj.name : siteId}`}
                  disabled={disabled}
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
        {selectedSites.length === 0 && (
          <span className="no-selection-placeholder">No job sites selected</span>
        )}
      </div>

      {/* Dropdown Input & Control */}
      <div className="dropdown-wrapper">
        <div
          className={`site-search-box ${isOpen ? 'active' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <input
            type="text"
            className="site-search-input"
            placeholder={disabled ? "Scraping in progress..." : "Select job sites (Indeed, LinkedIn)..."}
            value={searchTerm}
            onChange={(e) => {
              if (disabled) return;
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => !disabled && setIsOpen(true)}
            disabled={disabled}
          />
          <button
            type="button"
            className="dropdown-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setIsOpen(!isOpen);
            }}
            disabled={disabled}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>

        {isOpen && !disabled && (
          <div className="checkbox-list">
            {filteredSites.length > 0 ? (
              filteredSites.map((site) => {
                const isSelected = selectedSites.includes(site.id);
                const isItemDisabled = Boolean(site.disabled || site.comingSoon);

                return (
                  <label
                    key={site.id}
                    className={`checkbox-item ${isSelected ? 'selected' : ''} ${isItemDisabled ? 'item-disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSite(site.id)}
                      disabled={disabled || isItemDisabled}
                    />
                    <span className="custom-checkbox"></span>
                    <div className="option-info">
                      <span className="option-name">
                        {site.name}
                        {site.comingSoon && (
                          <span className="coming-soon-badge">Coming Soon</span>
                        )}
                      </span>
                      <span className="option-desc">{site.description}</span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="no-results">No sites found matching "{searchTerm}"</div>
            )}
          </div>
        )}
      </div>

      {isGoogleSelected && (
        <div className="google-alert">
          💡 <strong>Google Jobs Enabled:</strong> You can now configure customized Google Search Terms for each role below.
        </div>
      )}

      <ValidationMessage message={error} />
    </div>
  );
};

export default SiteMultiSelect;
