// AccessDenied.tsx
// components/AccessDenied.tsx
import React from 'react';
import { UserRole } from '@/app/hooks/useAccessControl';
import { UserRoleEnum } from '@/app/models/UserRoles';

interface CustomAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  secondary?: boolean;
}

interface AccessDeniedProps {
  feature?: string;
  requiredRole?: UserRole | UserRole[];
  userRole: UserRoleEnum;

  message?: string;
  type?: 'unauthorized' | 'access-denied' | 'permission';
  customActions?: CustomAction[];
  userContext?: {
    username: string;
    roles: string;
  };
  showHelpText?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  feature = "this feature",
  requiredRole, 
  userRole,
  message,
  type = 'permission',
  customActions,
  userContext,
  showHelpText = false
}) => {
  const defaultMessages = {
    'unauthorized': "You need to be logged in to access this feature.",
    'access-denied': "This area requires special permissions.",
    'permission': "You don't have permission to access this feature."
  };

  const finalMessage = message || defaultMessages[type];
  const roles = requiredRole ? 
    (Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole) : 
    undefined;

  // Default actions if no custom actions provided
  const defaultActions = {
    'unauthorized': [
      { label: 'Login', onClick: () => window.location.href = '/login', primary: true },
      { label: 'Go Back', onClick: () => window.history.back() }
    ],
    'access-denied': [
      { label: 'Go to Dashboard', onClick: () => window.location.href = '/dashboard', primary: true },
      { label: 'Go Back', onClick: () => window.history.back() }
    ],
    'permission': [
      { label: 'Go Back', onClick: () => window.history.back() },
      { label: 'Go to Dashboard', onClick: () => window.location.href = '/dashboard' }
    ]
  };

  const actions = customActions || defaultActions[type];

  const getIcon = () => {
    switch (type) {
      case 'unauthorized': return '🔐';
      case 'access-denied': return '🚫';
      case 'permission': return '🚫';
      default: return '🚫';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'unauthorized': return 'Access Denied';
      case 'access-denied': return 'Access Restricted';
      case 'permission': return 'Access Denied';
      default: return 'Access Denied';
    }
  };

  return (
    <div className={`access-denied ${type}-page`}>
      <div className="access-denied-content">
        <div className="icon">{getIcon()}</div>
        <h1>{getTitle()}</h1>
        <p>{finalMessage}</p>
        
        {/* User context information */}
        {userContext && (
          <div className="user-context">
            <div className="user-info">
              <strong>Logged in as:</strong> {userContext.username}
            </div>
            <div className="role-info">
              <strong>Roles:</strong> {userContext.roles}
            </div>
          </div>
        )}
        
        {/* Feature and role information */}
        <div className="feature-info">
          <strong>Feature:</strong> {feature}
        </div>
        
        {roles && (
          <div className="role-requirements">
            <strong>Required Role:</strong> {roles}
          </div>
        )}

        {/* Action buttons */}
        <div className="actions">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                action-btn 
                ${action.primary ? 'primary' : ''}
                ${action.danger ? 'danger' : ''}
                ${action.secondary ? 'secondary' : ''}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Help text */}
        {showHelpText && (
          <div className="help-text">
            <p>
              If you believe this is an error, please contact your administrator 
              or system support with details about what you were trying to access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;