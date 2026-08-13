import React from 'react';
import './ValidationMessage.css';

const ValidationMessage = ({ message, type = 'error' }) => {
  if (!message) return null;

  return (
    <div className={`validation-message ${type}`} role="alert">
      <span className="validation-icon">
        {type === 'error' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="validation-text">{message}</span>
    </div>
  );
};

export default ValidationMessage;
