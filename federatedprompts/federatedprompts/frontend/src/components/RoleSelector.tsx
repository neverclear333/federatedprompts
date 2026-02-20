/**
 * RoleSelector Component
 * Allows users to select from predefined team roles and add custom roles
 */

import React, { useState } from 'react';
import { VariableOption } from '../types/prompt';

interface RoleSelectorProps {
  predefinedRoles: VariableOption[];
  selectedRoles: string[];
  customRoles: string[];
  onRolesChange: (selectedRoles: string[], customRoles: string[]) => void;
  errors?: Array<{ field: string; message: string }>;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  predefinedRoles,
  selectedRoles,
  customRoles,
  onRolesChange,
  errors = [],
}) => {
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customRoleError, setCustomRoleError] = useState('');

  const validateCustomRole = (role: string): boolean => {
    if (!role.trim()) {
      setCustomRoleError('Role name cannot be empty');
      return false;
    }
    if (role.length < 3) {
      setCustomRoleError('Role name must be at least 3 characters');
      return false;
    }
    if (role.length > 50) {
      setCustomRoleError('Role name must not exceed 50 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(role)) {
      setCustomRoleError('Role name can only contain letters, numbers, spaces, hyphens, and underscores');
      return false;
    }
    if (customRoles.includes(role) || selectedRoles.includes(role)) {
      setCustomRoleError('This role already exists');
      return false;
    }
    setCustomRoleError('');
    return true;
  };

  const handleAddCustomRole = () => {
    if (validateCustomRole(customRoleInput)) {
      if (customRoles.length >= 5) {
        setCustomRoleError('Maximum 5 custom roles allowed');
        return;
      }
      onRolesChange([...selectedRoles, customRoleInput], [...customRoles, customRoleInput]);
      setCustomRoleInput('');
    }
  };

  const handleRemoveCustomRole = (role: string) => {
    const newSelectedRoles = selectedRoles.filter(r => r !== role);
    const newCustomRoles = customRoles.filter(r => r !== role);
    onRolesChange(newSelectedRoles, newCustomRoles);
  };

  const handleTogglePredefinedRole = (roleValue: string) => {
    if (selectedRoles.includes(roleValue)) {
      onRolesChange(
        selectedRoles.filter(r => r !== roleValue),
        customRoles
      );
    } else {
      onRolesChange([...selectedRoles, roleValue], customRoles);
    }
  };

  const fieldError = errors.find(e => e.field === 'projectContext.teamRoles');

  return (
    <div className="role-selector">
      <div className="role-selector-section">
        <h3>Predefined Team Roles</h3>
        <p className="section-description">Select one or more roles from the available options</p>
        <div className="role-grid">
          {predefinedRoles.map(role => (
            <label key={role.value} className="role-checkbox">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.value)}
                onChange={() => handleTogglePredefinedRole(role.value)}
              />
              <div className="role-label-content">
                <span className="role-name">{role.label}</span>
                {role.description && <span className="role-description">{role.description}</span>}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="role-selector-divider" />

      <div className="role-selector-section">
        <h3>Add Custom Roles</h3>
        <p className="section-description">Create custom roles specific to your project (max 5)</p>

        <div className="custom-role-input-group">
          <div className="input-container">
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => {
                setCustomRoleInput(e.target.value);
                setCustomRoleError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomRole();
                }
              }}
              placeholder="Enter a custom role name"
              className="custom-role-input"
              maxLength={50}
              disabled={customRoles.length >= 5}
            />
            <span className="char-count">{customRoleInput.length}/50</span>
          </div>

          <button
            onClick={handleAddCustomRole}
            disabled={customRoles.length >= 5 || !customRoleInput.trim()}
            className="btn btn-secondary btn-sm"
            title={customRoles.length >= 5 ? 'Maximum 5 custom roles allowed' : 'Add custom role'}
          >
            + Add Role
          </button>
        </div>

        {customRoleError && <div className="error-message">{customRoleError}</div>}
      </div>

      {customRoles.length > 0 && (
        <div className="role-selector-section">
          <h3>Custom Roles Added ({customRoles.length}/5)</h3>
          <div className="custom-roles-list">
            {customRoles.map(role => (
              <div key={role} className="custom-role-pill">
                <span className="role-name">{role}</span>
                <button
                  onClick={() => handleRemoveCustomRole(role)}
                  className="remove-btn"
                  aria-label={`Remove ${role}`}
                  title={`Remove ${role}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="role-selector-section">
        <h3>Selected Roles ({selectedRoles.length})</h3>
        {selectedRoles.length === 0 ? (
          <p className="no-selection">No roles selected. Please select at least one role.</p>
        ) : (
          <div className="selected-roles-list">
            {selectedRoles.map(role => {
              const predefinedRole = predefinedRoles.find(r => r.value === role);
              const isCustom = customRoles.includes(role);
              return (
                <span key={role} className={`selected-role-badge ${isCustom ? 'custom' : 'predefined'}`}>
                  {predefinedRole?.label || role}
                  {isCustom && <span className="custom-badge">(custom)</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {fieldError && (
        <div className="field-error">
          <span className="error-icon">⚠️</span>
          <div>
            <p className="error-message">{fieldError.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
