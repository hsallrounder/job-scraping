import React from 'react';
import {
  HOURS_OLD_OPTIONS,
  JOB_TYPE_OPTIONS,
  DESCRIPTION_FORMAT_OPTIONS,
  MIN_JOBS_PER_ROLE,
  MAX_JOBS_PER_ROLE
} from '../constants/options';
import ValidationMessage from './ValidationMessage';
import './ScrapingOptions.css';

const ScrapingOptions = ({
  jobsPerRole,
  hoursOld,
  removeDuplicates,
  jobType,
  isRemote,
  descriptionFormat,
  onJobsPerRoleChange,
  onHoursOldChange,
  onRemoveDuplicatesChange,
  onJobTypeChange,
  onIsRemoteChange,
  onDescriptionFormatChange,
  disabled,
  errors = {}
}) => {
  return (
    <div className={`section-card scraping-options-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">⚙️</span> 4. Scraping Options & Advanced Filters
        </h2>
      </div>

      <p className="section-description">
        Configure result limits, posting timeframe, job types, remote options, and data formatting.
      </p>

      <div className="options-grid">
        {/* Jobs Per Role */}
        <div className="option-card">
          <label className="field-label" htmlFor="jobs_per_role">
            Jobs Per Role / Country <span className="required-star">*</span>
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
            <span className="unit-label">results / site</span>
          </div>
          <span className="field-help">
            Allowed range: {MIN_JOBS_PER_ROLE} to {MAX_JOBS_PER_ROLE}.
          </span>
          <ValidationMessage message={errors.jobs_per_role} />
        </div>

        {/* Hours Old / Listings Age */}
        <div className={`option-card ${isRemote ? 'option-card-disabled' : ''}`}>
          <label className="field-label" htmlFor="hours_old">
            Listings Age (Hours Old)
          </label>
          <div className="select-wrapper">
            <select
              id="hours_old"
              className={`select-input ${errors.hours_old ? 'input-error' : ''}`}
              value={isRemote ? 0 : hoursOld}
              onChange={(e) => onHoursOldChange(Number(e.target.value))}
              disabled={disabled || isRemote}
            >
              {HOURS_OLD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          {isRemote ? (
            <span className="field-help field-help-disclaimer">
              ⚠️ <em>Disabled when <strong>Remote Only</strong> is active (few job portals accept either Listing Age or Remote filter at a time).</em>
            </span>
          ) : (
            <span className="field-help">
              Filters jobs posted within this timeframe.
            </span>
          )}
          <ValidationMessage message={errors.hours_old} />
        </div>


        {/* Job Type Filter */}
        <div className="option-card">
          <label className="field-label" htmlFor="job_type">
            Job Type
          </label>
          <div className="select-wrapper">
            <select
              id="job_type"
              className="select-input"
              value={jobType || ''}
              onChange={(e) => onJobTypeChange(e.target.value)}
              disabled={disabled}
            >
              {JOB_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          <span className="field-help">
            Filter by employment type across supported portals.
          </span>
        </div>

        {/* Remote Filter */}
        <div className="option-card">
          <label className="field-label">
            Remote Work
          </label>
          <div className="radio-group">
            <label className={`radio-option ${isRemote === false ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
              <input
                type="radio"
                name="is_remote"
                checked={isRemote === false}
                onChange={() => !disabled && onIsRemoteChange(false)}
                disabled={disabled}
              />
              <span className="radio-dot"></span>
              <span className="radio-label-text">All (Onsite & Remote)</span>
            </label>

            <label className={`radio-option ${isRemote === true ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
              <input
                type="radio"
                name="is_remote"
                checked={isRemote === true}
                onChange={() => !disabled && onIsRemoteChange(true)}
                disabled={disabled}
              />
              <span className="radio-dot"></span>
              <span className="radio-label-text">🏠 Remote Only</span>
            </label>
          </div>
          <span className="field-help">
            Filter specifically for work-from-home / remote opportunities.
          </span>
        </div>

        {/* Description Format */}
        <div className="option-card">
          <label className="field-label" htmlFor="description_format">
            Description Format
          </label>
          <div className="select-wrapper">
            <select
              id="description_format"
              className="select-input"
              value={descriptionFormat || 'markdown'}
              onChange={(e) => onDescriptionFormatChange(e.target.value)}
              disabled={disabled}
            >
              {DESCRIPTION_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          <span className="field-help">
            Format used for extracted job description content.
          </span>
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
            Deduplicates records matching title, company, and location.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScrapingOptions;


