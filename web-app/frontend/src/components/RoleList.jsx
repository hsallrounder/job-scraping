import React from 'react';
import RoleForm from './RoleForm';
import ValidationMessage from './ValidationMessage';
import './RoleList.css';

const RoleList = ({
  roles,
  isGoogleSelected,
  onAddRole,
  onRoleChange,
  onRemoveRole,
  disabled,
  error,
  roleErrors = {}
}) => {
  return (
    <div className={`section-card role-list-container ${disabled ? 'card-disabled' : ''}`}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">💼</span> 2. Job Roles
        </h2>
        <span className="selection-count">
          {roles.length} {roles.length === 1 ? 'role' : 'roles'} configured
        </span>
      </div>

      <p className="section-description">
        Define target job titles. Add multiple roles to scrape opportunities for different titles in one run.
      </p>

      <div className="role-items-wrapper">
        {roles.length > 0 ? (
          roles.map((role, idx) => (
            <RoleForm
              key={role.id}
              role={role}
              index={idx}
              isGoogleSelected={isGoogleSelected}
              onChange={onRoleChange}
              onRemove={onRemoveRole}
              canRemove={roles.length > 0}
              disabled={disabled}
              errors={roleErrors[role.id] || {}}
            />
          ))
        ) : (
          <div className="empty-roles-notice">
            <span>⚠️ No job roles added yet. Click below to add at least one role.</span>
          </div>
        )}
      </div>

      <ValidationMessage message={error} />

      {!disabled && (
        <div className="role-actions">
          <button
            type="button"
            className="add-role-btn"
            onClick={onAddRole}
            disabled={disabled}
          >
            ➕ Add Role
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleList;
