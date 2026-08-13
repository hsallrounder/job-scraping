import React from 'react';
import {
  HOURS_OLD_OPTIONS,
  MIN_JOBS_PER_ROLE,
  MAX_JOBS_PER_ROLE
} from '../constants/options';
import ValidationMessage from './ValidationMessage';
import './ScrapingOptions.css';

const ScrapingOptions = ({
  jobsPerRole,
  hoursOld,
  removeDuplicates,
  onJobsPerRoleChange,
  onHoursOldChange,
  onRemoveDuplicatesChange,
  disabled,
  errors = {}
}) => {
  return (
    <div className={`section-card scraping-options-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">⚙️</span> 4. Scraping Options
        </h2>
      </div>

      <p className="section-description">
        Configure limits, age of listings to fetch, and deduplication behavior.
      </p>

      <div className="options-grid">
        {/* Jobs Per Role */}
        <div className="option-card">
          <label className="field-label" htmlFor="jobs_per_role">
            Jobs Per Role <span className="required-star">*</span>
          </label>
          <div className="number-input-wrapper">
            <input
              id="jobs_per_role"
              type="number"
              min={MIN_JOBS_PER_ROLE}
              max={MAX_JOBS_PER_ROLE}
              className={`number-input ${errors.jobs_per_role ? 'input-error' : ''}`}
              value={jobsPerRole}
              onChange={(e) => onJobsPerRoleChange(e.target.value)}
              disabled={disabled}
            />
            <span className="unit-label">jobs / role</span>
          </div>
          <span className="field-help">
            Allowed range: {MIN_JOBS_PER_ROLE} to {MAX_JOBS_PER_ROLE}.
          </span>
          <ValidationMessage message={errors.jobs_per_role} />
        </div>

        {/* Hours Old */}
        <div className="option-card">
          <label className="field-label" htmlFor="hours_old">
            Listings Age (Hours Old) <span className="required-star">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="hours_old"
              className={`select-input ${errors.hours_old ? 'input-error' : ''}`}
              value={hoursOld}
              onChange={(e) => onHoursOldChange(Number(e.target.value))}
              disabled={disabled}
            >
              {HOURS_OLD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          <span className="field-help">
            Fetch jobs posted within this timeframe.
          </span>
          <ValidationMessage message={errors.hours_old} />
        </div>

        {/* Remove Duplicates */}
        <div className="option-card">
          <label className="field-label">
            Remove Duplicates
          </label>
          <div className="radio-group">
            <label className={`radio-option ${removeDuplicates === true ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
              <input
                type="radio"
                name="remove_duplicates"
                checked={removeDuplicates === true}
                onChange={() => !disabled && onRemoveDuplicatesChange(true)}
                disabled={disabled}
              />
              <span className="radio-dot"></span>
              <span className="radio-label-text">Yes (Recommended)</span>
            </label>

            <label className={`radio-option ${removeDuplicates === false ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
              <input
                type="radio"
                name="remove_duplicates"
                checked={removeDuplicates === false}
                onChange={() => !disabled && onRemoveDuplicatesChange(false)}
                disabled={disabled}
              />
              <span className="radio-dot"></span>
              <span className="radio-label-text">No</span>
            </label>
          </div>
          <span className="field-help">
            Automatically filter out duplicate job postings matching title, company & location.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScrapingOptions;
