import React, { useState } from 'react';
import { AVAILABLE_COUNTRIES } from '../constants/options';
import ValidationMessage from './ValidationMessage';
import './CountryMultiSelect.css';

const CountryMultiSelect = ({ selectedCountries, onChange, error, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = AVAILABLE_COUNTRIES.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCountry = (country) => {
    if (disabled) return;
    if (selectedCountries.includes(country)) {
      onChange(selectedCountries.filter((c) => c !== country));
    } else {
      onChange([...selectedCountries, country]);
    }
  };

  const removeCountry = (country, e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedCountries.filter((c) => c !== country));
  };

  return (
    <div className={`section-card country-multiselect-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">📍</span> 3. Location / Countries
        </h2>
        <span className="selection-count">
          {selectedCountries.length} selected
        </span>
      </div>

      <p className="section-description">
        Select target countries for job listings. <em>India</em> is selected by default. You can select multiple countries.
      </p>

      {/* Selected Country Tags */}
      <div className="selected-country-tags">
        {selectedCountries.map((country) => (
          <span key={country} className="country-tag">
            {country}
            {!disabled && (
              <button
                type="button"
                className="country-remove-btn"
                onClick={(e) => removeCountry(country, e)}
                title={`Remove ${country}`}
                disabled={disabled}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {selectedCountries.length === 0 && (
          <span className="no-country-placeholder">No countries selected</span>
        )}
      </div>

      {/* Dropdown & Search Input */}
      <div className="country-dropdown-wrapper">
        <div
          className={`country-search-box ${isOpen ? 'active' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <input
            type="text"
            className="country-search-input"
            placeholder={disabled ? "Scraping in progress..." : "Search countries (e.g. India, United States, Canada)..."}
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
            className="country-dropdown-toggle"
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
          <div className="country-checkbox-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCountries.includes(country);
                return (
                  <label
                    key={country}
                    className={`country-checkbox-item ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCountry(country)}
                      disabled={disabled}
                    />
                    <span className="country-name">{country}</span>
                  </label>
                );
              })
            ) : (
              <div className="no-country-results">
                No countries found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      <ValidationMessage message={error} />
    </div>
  );
};

export default CountryMultiSelect;
