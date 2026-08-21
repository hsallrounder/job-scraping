import React from 'react';
import ValidationMessage from './ValidationMessage';
import './RoleForm.css';

const RoleForm = ({
  role,
  index,
  isGoogleSelected,
  hasOtherSites = true,
  onChange,
  onRemove,
  canRemove,
  disabled,
  errors = {}
}) => {
  const handleSearchTermChange = (e) => {
    onChange(role.id, 'search_term', e.target.value);
  };

  const handleGoogleSearchTermChange = (e) => {
    onChange(role.id, 'google_search_term', e.target.value);
  };

  const isSearchTermDisabled = disabled || !hasOtherSites;

  return (
    <div className={`role-card ${disabled ? 'card-disabled' : ''}`}>
      <div className="role-card-header">
        <span className="role-badge">Role {index + 1}</span>
        {canRemove && !disabled && (
          <button
            type="button"
            className="remove-role-btn"
            onClick={() => onRemove(role.id)}
            title="Remove this role"
            disabled={disabled}
          >
            🗑️ Remove Role
          </button>
        )}
      </div>

      <div className="role-fields">
        {/* Main Search Term - Disabled when no other sites selected (e.g. only Google Jobs selected) */}
        <div className={`form-group ${!hasOtherSites ? 'form-group-disabled' : ''}`}>
          <label className="field-label" htmlFor={`search_term_${role.id}`}>
            Search Term {hasOtherSites && <span className="required-star">*</span>}
          </label>
          <input
            id={`search_term_${role.id}`}
            type="text"
            className={`text-input ${errors.search_term ? 'input-error' : ''}`}
            placeholder={
              !hasOtherSites
                ? "Disabled — not needed when only Google Jobs is selected"
                : "e.g. Backend Engineer, SDE Intern, Data Analyst..."
            }
            value={role.search_term || ''}
            onChange={handleSearchTermChange}
            disabled={isSearchTermDisabled}
          />
          <span className="field-help">
            {!hasOtherSites
              ? "Search Term is disabled because Google Jobs exclusively uses the Google Search Term below."
              : "The primary title or keyword to search across job sites."}
          </span>
          <ValidationMessage message={errors.search_term} />
        </div>


        {/* Conditional Google Search Term */}
        {isGoogleSelected && (
          <div className="form-group google-field-group">
            <label className="field-label" htmlFor={`google_search_${role.id}`}>
              Google Search Term <span className="required-star">*</span>
            </label>
            <input
              id={`google_search_${role.id}`}
              type="text"
              className={`text-input ${errors.google_search_term ? 'input-error' : ''}`}
              placeholder="e.g. Fresher OR Entry Level 'Backend Engineer' job in India since 1 days"
              value={role.google_search_term || ''}
              onChange={handleGoogleSearchTermChange}
              disabled={disabled}
            />
            <span className="field-help">
              Google boolean/keyword query syntax used specifically for Google Jobs searches.
            </span>
            <ValidationMessage message={errors.google_search_term} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleForm;
