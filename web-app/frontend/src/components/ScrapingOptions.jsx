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
  sites = ['indeed', 'linkedin'],
  jobsPerRole,
  descriptionFormat,
  removeDuplicates,
  hoursOldIndeed = 24,
  jobType = '',
  isRemote = false,
  hoursOldLinkedin = 24,
  fetchLinkedinDescription = true,
  onJobsPerRoleChange,
  onDescriptionFormatChange,
  onRemoveDuplicatesChange,
  onHoursOldIndeedChange,
  onJobTypeChange,
  onIsRemoteChange,
  onHoursOldLinkedinChange,
  onFetchLinkedinDescriptionChange,
  disabled,
  errors = {}
}) => {
  const isIndeedSelected = sites.includes('indeed');
  const isLinkedInSelected = sites.includes('linkedin');

  // Indeed mutual exclusion: Job Type / Remote Only conflicts with Listing Age on Indeed
  const isIndeedFilterActive = isIndeedSelected && Boolean(jobType || isRemote);

  return (
    <div className={`section-card scraping-options-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">⚙️</span> 4. Scraping Parameters & Site Controls
        </h2>
      </div>

      <p className="section-description">
        Configure universal scraping settings as well as site-specific filters for each active portal.
      </p>

      {/* SECTION 1: Universal / Global Parameters */}
      <div className="site-options-section global-section">
        <div className="site-options-section-header">
          <div className="site-title-group">
            <span className="site-section-icon">🌐</span>
            <div>
              <h3 className="site-section-title">Universal Parameters</h3>
              <p className="site-section-subtitle">Applies across all selected job portals</p>
            </div>
          </div>
          <span className="site-status-tag tag-active">Active on All Sites</span>
        </div>

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
              Target results to extract per role per country.
            </span>
            <ValidationMessage message={errors.jobs_per_role} />
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
              Deduplicates records across title, company, and location.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Indeed Specific Options */}
      <div className={`site-options-section indeed-section ${!isIndeedSelected ? 'section-inactive' : ''}`}>
        <div className="site-options-section-header">
          <div className="site-title-group">
            <span className="site-section-icon icon-indeed">🔍</span>
            <div>
              <h3 className="site-section-title">Indeed Options</h3>
              <p className="site-section-subtitle">Dedicated search parameters for Indeed</p>
            </div>
          </div>
          <span className={`site-status-tag ${isIndeedSelected ? 'tag-indeed-active' : 'tag-disabled'}`}>
            {isIndeedSelected ? 'Indeed Active' : 'Indeed Not Selected'}
          </span>
        </div>

        {!isIndeedSelected ? (
          <div className="site-inactive-notice">
            <span>ℹ️ Indeed is not selected in <strong>1. Job Sites</strong>. Select Indeed above to activate these options.</span>
          </div>
        ) : (
          <div className="options-grid">
            {/* Indeed Listings Age */}
            <div className={`option-card ${isIndeedFilterActive ? 'option-card-disabled' : ''}`}>
              <label className="field-label" htmlFor="hours_old_indeed">
                Indeed Listings Age (Hours Old)
              </label>
              <div className="select-wrapper">
                <select
                  id="hours_old_indeed"
                  className="select-input"
                  value={isIndeedFilterActive ? 0 : hoursOldIndeed}
                  onChange={(e) => onHoursOldIndeedChange(Number(e.target.value))}
                  disabled={disabled || isIndeedFilterActive}
                >
                  {HOURS_OLD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
              {isIndeedFilterActive ? (
                <span className="field-help field-help-disclaimer">
                  ⚠️ <em>Disabled because <strong>{jobType && isRemote ? 'Job Type & Remote Only' : jobType ? 'Job Type' : 'Remote Only'}</strong> is selected (Indeed does not support combining Listing Age with Job Type/Remote).</em>
                </span>
              ) : (
                <span className="field-help">
                  Filter jobs posted within this timeframe on Indeed.
                </span>
              )}
            </div>

            {/* Indeed Job Type */}
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
                Filter by employment type on Indeed (disables Indeed Listings Age).
              </span>
            </div>

            {/* Indeed Remote Work */}
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
                Filter for remote opportunities on Indeed (disables Indeed Listings Age).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: LinkedIn Specific Options */}
      <div className={`site-options-section linkedin-section ${!isLinkedInSelected ? 'section-inactive' : ''}`}>
        <div className="site-options-section-header">
          <div className="site-title-group">
            <span className="site-section-icon icon-linkedin">💼</span>
            <div>
              <h3 className="site-section-title">LinkedIn Options</h3>
              <p className="site-section-subtitle">Dedicated search parameters for LinkedIn</p>
            </div>
          </div>
          <span className={`site-status-tag ${isLinkedInSelected ? 'tag-linkedin-active' : 'tag-disabled'}`}>
            {isLinkedInSelected ? 'LinkedIn Active' : 'LinkedIn Not Selected'}
          </span>
        </div>

        {!isLinkedInSelected ? (
          <div className="site-inactive-notice">
            <span>ℹ️ LinkedIn is not selected in <strong>1. Job Sites</strong>. Select LinkedIn above to activate these options.</span>
          </div>
        ) : (
          <div className="options-grid">
            {/* LinkedIn Listings Age */}
            <div className="option-card">
              <label className="field-label" htmlFor="hours_old_linkedin">
                LinkedIn Listings Age (Hours Old)
              </label>
              <div className="select-wrapper">
                <select
                  id="hours_old_linkedin"
                  className="select-input"
                  value={hoursOldLinkedin}
                  onChange={(e) => onHoursOldLinkedinChange(Number(e.target.value))}
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
                Filter jobs posted within this timeframe on LinkedIn.
              </span>
            </div>

            {/* LinkedIn Description Detail Level */}
            <div className="option-card">
              <label className="field-label">
                LinkedIn Description Detail
              </label>
              <div className="radio-group">
                <label className={`radio-option ${fetchLinkedinDescription === true ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
                  <input
                    type="radio"
                    name="fetch_linkedin_description"
                    checked={fetchLinkedinDescription === true}
                    onChange={() => !disabled && onFetchLinkedinDescriptionChange(true)}
                    disabled={disabled}
                  />
                  <span className="radio-dot"></span>
                  <span className="radio-label-text">Full Details (Deep)</span>
                </label>

                <label className={`radio-option ${fetchLinkedinDescription === false ? 'selected' : ''} ${disabled ? 'radio-disabled' : ''}`}>
                  <input
                    type="radio"
                    name="fetch_linkedin_description"
                    checked={fetchLinkedinDescription === false}
                    onChange={() => !disabled && onFetchLinkedinDescriptionChange(false)}
                    disabled={disabled}
                  />
                  <span className="radio-dot"></span>
                  <span className="radio-label-text">Fast Summary</span>
                </label>
              </div>
              <span className="field-help">
                Extracts complete JD text and direct applicant link per LinkedIn posting.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapingOptions;




