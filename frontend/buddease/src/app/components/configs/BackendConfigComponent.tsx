// BackendConfigComponent.tsx
// components/configs/BackendConfigComponent.tsx
import { BackendConfig } from '@/app/config/BackendConfig';
import { useDashboard } from '@/app/state/context/DashboardContext';
import { useAuth } from '@/app/state/context/AuthContext';
import React from 'react';

interface BackendConfigComponentProps {
  backendConfig: BackendConfig;
  showAdvanced?: boolean;
  onConfigUpdate?: (config: Partial<BackendConfig>) => void;
}

const BackendConfigComponent: React.FC<BackendConfigComponentProps> = ({ 
  backendConfig, 
  showAdvanced = false,
  onConfigUpdate 
}) => {
  const { user, hasPermission } = useAuth();
  const { currentDashboard } = useDashboard();

  const canEditConfig = hasPermission('admin_access') || hasPermission('system_config');

  const handleConfigChange = (key: keyof BackendConfig, value: any) => {
    if (onConfigUpdate && canEditConfig) {
      onConfigUpdate({ [key]: value });
    }
  };

  const renderConfigSection = (title: string, config: any, sectionKey: string) => (
    <div className="config-section">
      <h3 className="section-title">{title}</h3>
      <div className="config-grid">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="config-item">
            <label className="config-label">{key}:</label>
            {canEditConfig && typeof value === 'string' ? (
              <input
                type="text"
                value={value as string}
                onChange={(e) => handleConfigChange(`${sectionKey}.${key}` as any, e.target.value)}
                className="config-input"
              />
            ) : (
              <span className="config-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const getDatabaseStatus = (config: any) => {
    if (!config.database) return 'Unknown';
    return config.database.connected ? 'Connected' : 'Disconnected';
  };

  const getApiStatus = (config: any) => {
    if (!config.api) return 'Unknown';
    return config.api.healthy ? 'Healthy' : 'Unhealthy';
  };

  return (
    <div className="backend-config-component">
      <div className="config-header">
        <h2>Backend Configuration</h2>
        <div className="config-status">
          <span className={`status-indicator status-${getDatabaseStatus(backendConfig).toLowerCase()}`}>
            DB: {getDatabaseStatus(backendConfig)}
          </span>
          <span className={`status-indicator status-${getApiStatus(backendConfig).toLowerCase()}`}>
            API: {getApiStatus(backendConfig)}
          </span>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="config-section">
        <h3>Application Info</h3>
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label">App Name:</label>
            <span className="config-value">{backendConfig.appName}</span>
          </div>
          <div className="config-item">
            <label className="config-label">Version:</label>
            <span className="config-value">{backendConfig.appVersion}</span>
          </div>
          <div className="config-item">
            <label className="config-label">Environment:</label>
            <span className={`config-value environment-${backendConfig.environment?.toLowerCase()}`}>
              {backendConfig.environment}
            </span>
          </div>
          {backendConfig.api && (
            <div className="config-item">
              <label className="config-label">API Base URL:</label>
              <span className="config-value">{backendConfig.api.baseUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Configuration */}
      {backendConfig.database && (
        <div className="config-section">
          <h3>Database</h3>
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">Type:</label>
              <span className="config-value">{backendConfig.database.type}</span>
            </div>
            <div className="config-item">
              <label className="config-label">Host:</label>
              <span className="config-value">{backendConfig.database.host}</span>
            </div>
            <div className="config-item">
              <label className="config-label">Port:</label>
              <span className="config-value">{backendConfig.database.port}</span>
            </div>
            {showAdvanced && backendConfig.database.pool && (
              <>
                <div className="config-item">
                  <label className="config-label">Max Connections:</label>
                  <span className="config-value">{backendConfig.database.pool.max}</span>
                </div>
                <div className="config-item">
                  <label className="config-label">Idle Timeout:</label>
                  <span className="config-value">{backendConfig.database.pool.idleTimeoutMs}ms</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Authentication Configuration */}
      {backendConfig.auth && (
        <div className="config-section">
          <h3>Authentication</h3>
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">JWT Expiry:</label>
              <span className="config-value">{backendConfig.auth.jwtExpiry}</span>
            </div>
            <div className="config-item">
              <label className="config-label">Refresh Token Expiry:</label>
              <span className="config-value">{backendConfig.auth.refreshTokenExpiry}</span>
            </div>
            {backendConfig.auth.providers && (
              <div className="config-item">
                <label className="config-label">Providers:</label>
                <span className="config-value">
                  {backendConfig.auth.providers.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current User Context */}
      {user && (
        <div className="config-section user-context">
          <h3>User Context</h3>
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">Current User:</label>
              <span className="config-value">{user.username}</span>
            </div>
            <div className="config-item">
              <label className="config-label">Roles:</label>
              <span className="config-value">{user.roles?.join(', ')}</span>
            </div>
            <div className="config-item">
              <label className="config-label">Dashboard:</label>
              <span className="config-value">{currentDashboard}</span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Configuration */}
      {showAdvanced && backendConfig.features && (
        <div className="config-section">
          <h3>Feature Flags</h3>
          <div className="config-grid">
            {Object.entries(backendConfig.features).map(([feature, enabled]) => (
              <div key={feature} className="config-item">
                <label className="config-label">{feature}:</label>
                <span className={`config-value feature-${enabled ? 'enabled' : 'disabled'}`}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {backendConfig.performance && (
        <div className="config-section">
          <h3>Performance</h3>
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">Cache TTL:</label>
              <span className="config-value">{backendConfig.performance.cacheTtl}ms</span>
            </div>
            <div className="config-item">
              <label className="config-label">Request Timeout:</label>
              <span className="config-value">{backendConfig.performance.requestTimeout}ms</span>
            </div>
            {backendConfig.performance.rateLimiting && (
              <div className="config-item">
                <label className="config-label">Rate Limit:</label>
                <span className="config-value">
                  {backendConfig.performance.rateLimiting.requestsPerMinute} req/min
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Notice */}
      {canEditConfig && onConfigUpdate && (
        <div className="edit-notice">
          <p>You have permission to edit these configuration values.</p>
        </div>
      )}
    </div>
  );
};

export default BackendConfigComponent;