// BackendStructureViewer.tsx
import { useCurrentUser, useRoleAccess } from '@/core/hooks/useRoleAccess';
import { UserRole } from '@/core/models/UserRole';
import { UserRoleEnum } from '@/core/models/UserRoles';
import AccessDenied from '@/core/pages/AccessDenied';
import React, { useState } from 'react';

// Interface for backend file info
interface BackendFileInfo {
  path: string;
  type: string;
  description?: string;
  isSensitive?: boolean;
  size?: string;
  lastModified?: Date;
  database?: string;
  table?: string;
  schema?: string;
  permissions?: string[];
  endpoints?: string[];
}

// Backend structure type
interface BackendStructure {
  getStructure: () => Record<string, BackendFileInfo>;
  getDatabases?: () => string[];
  getApiEndpoints?: () => string[];
  getSchemas?: () => string[];
}

interface BackendStructureViewerProps {
  backendStructure: BackendStructure;
  showSensitiveData?: boolean;
  onDatabaseSelect?: (dbName: string) => void;
  onApiEndpointClick?: (endpoint: string) => void;
  onSchemaView?: (schemaName: string) => void;
  showDatabaseDetails?: boolean;
  showApiEndpoints?: boolean;
  showSchemaView?: boolean;
}

const BackendStructureViewer: React.FC<BackendStructureViewerProps> = ({ 
  backendStructure,
  showSensitiveData = false,
  onDatabaseSelect,
  onApiEndpointClick,
  onSchemaView,
  showDatabaseDetails = true,
  showApiEndpoints = true,
  showSchemaView = true
}) => {
  const { userRole, isLoading: userLoading } = useCurrentUser();
  const [showActionDenied, setShowActionDenied] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'databases' | 'endpoints' | 'schemas'>('files');
  
  // Check permissions for backend access
  const { hasAccess: canView, isLoading: viewLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'view:backend-structure'
  });

  const { hasAccess: canAccessDatabase, isLoading: dbLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'access:database'
  });

  const { hasAccess: canModifyAPI, isLoading: apiLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'modify:api-endpoints'
  });

  const { hasAccess: canManageSchema, isLoading: schemaLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'manage:database-schema'
  });

  const isLoading = userLoading || viewLoading || dbLoading || apiLoading || schemaLoading;

  const handleDatabaseSelect = (dbName: string) => {
    if (!canAccessDatabase) {
      setShowActionDenied('database-access');
      return;
    }
    setSelectedDatabase(dbName);
    onDatabaseSelect?.(dbName);
  };

  const handleApiEndpointClick = (endpoint: string) => {
    if (!canModifyAPI) {
      setShowActionDenied('api-modify');
      return;
    }
    onApiEndpointClick?.(endpoint);
  };

  const handleSchemaView = (schemaName: string) => {
    if (!canManageSchema) {
      setShowActionDenied('schema-manage');
      return;
    }
    onSchemaView?.(schemaName);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Checking backend access permissions...</p>
      </div>
    );
  }

  // Show access denied if user cannot view backend structure
  if (!canView) {
    const allowedRoles: UserRole[] = [
      UserRoleEnum.Developer,
      UserRoleEnum.Administrator,
      UserRoleEnum.System,
      UserRoleEnum.DatabaseAdmin,
      UserRoleEnum.BackendDeveloper
    ];

    return (
      <AccessDenied 
        feature="Backend Structure Viewer"
        requiredRole={allowedRoles}
        userRole={userRole}
        message={`You need permission to view backend structure. Your current role (${userRole}) does not have sufficient permissions.`}
        type="permission"
        userContext={{
          username: "Current User",
          roles: userRole
        }}
        showHelpText={true}
        customActions={[
          { 
            label: 'Request Access', 
            onClick: () => window.location.href = '/request-access?feature=backend-structure',
            primary: true 
          },
          { 
            label: 'Go to Dashboard', 
            onClick: () => window.location.href = '/dashboard'
          },
          { 
            label: 'Contact Database Admin', 
            onClick: () => window.location.href = '/contact-admin?type=database',
            secondary: true 
          }
        ]}
      />
    );
  }

  // Show action-level permission denied
  if (showActionDenied) {
    const actionMessages = {
      'database-access': 'access databases',
      'api-modify': 'modify API endpoints',
      'schema-manage': 'manage database schemas'
    };

    const requiredPermissions = {
      'database-access': 'access:database',
      'api-modify': 'modify:api-endpoints', 
      'schema-manage': 'manage:database-schema'
    };

    return (
      <AccessDenied 
        feature={`Ability to ${actionMessages[showActionDenied as keyof typeof actionMessages]}`}
        requiredRole={[UserRoleEnum.DatabaseAdmin, UserRoleEnum.Administrator, UserRoleEnum.System]}
        userRole={userRole}
        message={`Your current role (${userRole}) does not have permission to ${actionMessages[showActionDenied as keyof typeof actionMessages]}.`}
        type="permission"
        userContext={{
          username: "Current User",
          roles: userRole
        }}
        showHelpText={true}
        customActions={[
          { 
            label: 'Continue Viewing', 
            onClick: () => setShowActionDenied(null),
            primary: true 
          },
          { 
            label: 'Request Permission', 
            onClick: () => window.location.href = `/request-permission?permission=${requiredPermissions[showActionDenied as keyof typeof requiredPermissions]}`,
            secondary: true 
          }
        ]}
      />
    );
  }

  const structure = backendStructure.getStructure();
  const databases = backendStructure.getDatabases?.() || [];
  const endpoints = backendStructure.getApiEndpoints?.() || [];
  const schemas = backendStructure.getSchemas?.() || [];
  
  // Filter structure entries based on permissions and sensitive data settings
  const structureEntries = Object.entries(structure).filter(
    ([_, fileInfo]) => {
      if (fileInfo.isSensitive && !canAccessDatabase && !showSensitiveData) {
        return false;
      }
      return true;
    }
  );

  // Determine access level for display
  const getAccessLevel = () => {
    const levels = [];
    if (canManageSchema) levels.push('Schema Management');
    if (canModifyAPI) levels.push('API Modification');
    if (canAccessDatabase) levels.push('Database Access');
    if (levels.length === 0) return 'View Only';
    return levels.join(', ');
  };

  return (
    <div className="backend-structure-viewer">
      <div className="viewer-header">
        <h2>Backend Structure</h2>
        <div className="viewer-controls">
          <span className="access-level">
            Role: <strong>{userRole}</strong> | Access: <strong>{getAccessLevel()}</strong>
          </span>
          <div className="viewer-tabs">
            <button 
              className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Files
            </button>
            {showDatabaseDetails && databases.length > 0 && (
              <button 
                className={`tab-btn ${activeTab === 'databases' ? 'active' : ''}`}
                onClick={() => setActiveTab('databases')}
              >
                Databases ({databases.length})
              </button>
            )}
            {showApiEndpoints && endpoints.length > 0 && (
              <button 
                className={`tab-btn ${activeTab === 'endpoints' ? 'active' : ''}`}
                onClick={() => setActiveTab('endpoints')}
              >
                API Endpoints ({endpoints.length})
              </button>
            )}
            {showSchemaView && schemas.length > 0 && (
              <button 
                className={`tab-btn ${activeTab === 'schemas' ? 'active' : ''}`}
                onClick={() => setActiveTab('schemas')}
              >
                Schemas ({schemas.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="structure-stats">
        <span>Total Files: {structureEntries.length}</span>
        {databases.length > 0 && <span>Databases: {databases.length}</span>}
        {endpoints.length > 0 && <span>API Endpoints: {endpoints.length}</span>}
        {schemas.length > 0 && <span>Schemas: {schemas.length}</span>}
        {structureEntries.some(([_, fileInfo]) => fileInfo.isSensitive) && (
          <span className="sensitive-count">
            Sensitive Files: {structureEntries.filter(([_, fileInfo]) => fileInfo.isSensitive).length}
          </span>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'files' && (
          <div className="structure-list">
            {structureEntries.length === 0 ? (
              <div className="empty-state">
                <p>No backend files to display.</p>
                {!showSensitiveData && structureEntries.length === 0 && (
                  <p>Some files may be hidden due to sensitivity settings.</p>
                )}
              </div>
            ) : (
              structureEntries.map(([fileName, fileInfo]) => (
                <div 
                  key={fileName} 
                  className={`file-item ${fileInfo.isSensitive ? 'sensitive' : ''} ${fileInfo.type}`}
                >
                  <div className="file-header">
                    <div className="file-info">
                      <strong className="file-name">{fileName}</strong>
                      {fileInfo.isSensitive && (
                        <span className="sensitive-badge" title="Contains sensitive data">
                          🔒 Sensitive
                        </span>
                      )}
                      <span className="file-type">{fileInfo.type}</span>
                      {fileInfo.database && (
                        <span className="database-badge" title="Associated database">
                          🗄️ {fileInfo.database}
                        </span>
                      )}
                    </div>
                    
                    {/* File actions */}
                    <div className="file-actions">
                      {fileInfo.database && canAccessDatabase && (
                        <button 
                          className="action-btn database"
                          onClick={() => handleDatabaseSelect(fileInfo.database!)}
                          title="View database"
                        >
                          View DB
                        </button>
                      )}
                      {fileInfo.endpoints && fileInfo.endpoints.length > 0 && canModifyAPI && (
                        <button 
                          className="action-btn api"
                          onClick={() => fileInfo.endpoints && handleApiEndpointClick(fileInfo.endpoints[0])}
                          title="View API endpoints"
                        >
                          API
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="file-details">
                    <div className="file-path" title="File path">
                      📁 {fileInfo.path}
                    </div>
                    
                    {fileInfo.description && (
                      <div className="file-description">
                        {fileInfo.description}
                      </div>
                    )}
                    
                    {/* Database and API info */}
                    {(fileInfo.database || fileInfo.endpoints) && (
                      <div className="file-meta">
                        {fileInfo.database && (
                          <span className="database-info">Database: {fileInfo.database}</span>
                        )}
                        {fileInfo.endpoints && fileInfo.endpoints.length > 0 && (
                          <span className="endpoints-info">
                            Endpoints: {fileInfo.endpoints.slice(0, 2).join(', ')}
                            {fileInfo.endpoints.length > 2 && ` and ${fileInfo.endpoints.length - 2} more`}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Additional metadata */}
                    {(fileInfo.size || fileInfo.lastModified) && (
                      <div className="file-meta">
                        {fileInfo.size && (
                          <span className="file-size">Size: {fileInfo.size}</span>
                        )}
                        {fileInfo.lastModified && (
                          <span className="file-modified">
                            Modified: {new Date(fileInfo.lastModified).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'databases' && databases.length > 0 && (
          <div className="databases-list">
            <h3>Available Databases</h3>
            <div className="databases-grid">
              {databases.map((dbName) => (
                <div 
                  key={dbName} 
                  className={`database-card ${selectedDatabase === dbName ? 'selected' : ''}`}
                  onClick={() => handleDatabaseSelect(dbName)}
                >
                  <div className="database-icon">🗄️</div>
                  <div className="database-info">
                    <h4>{dbName}</h4>
                    <p>Click to view details</p>
                  </div>
                  {canAccessDatabase && (
                    <button className="select-btn">
                      {selectedDatabase === dbName ? 'Selected' : 'Select'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && endpoints.length > 0 && (
          <div className="endpoints-list">
            <h3>API Endpoints</h3>
            <div className="endpoints-table">
              <table>
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint) => {
                    const [method, path] = endpoint.split(' ');
                    return (
                      <tr key={endpoint}>
                        <td className="endpoint-path">{path}</td>
                        <td>
                          <span className={`method-badge ${method.toLowerCase()}`}>
                            {method}
                          </span>
                        </td>
                        <td className="endpoint-desc">
                          {structureEntries.find(([_, info]) => 
                            info.endpoints?.includes(endpoint)
                          )?.[1]?.description || 'No description'}
                        </td>
                        <td>
                          {canModifyAPI && (
                            <button 
                              className="action-btn api-view"
                              onClick={() => handleApiEndpointClick(endpoint)}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schemas' && schemas.length > 0 && (
          <div className="schemas-list">
            <h3>Database Schemas</h3>
            <div className="schemas-grid">
              {schemas.map((schemaName) => (
                <div key={schemaName} className="schema-card">
                  <div className="schema-icon">📊</div>
                  <div className="schema-info">
                    <h4>{schemaName}</h4>
                    <p>Database schema definition</p>
                  </div>
                  {canManageSchema && (
                    <button 
                      className="action-btn schema-view"
                      onClick={() => handleSchemaView(schemaName)}
                    >
                      View Schema
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permission-based footer */}
      <div className="viewer-footer">
        {!canAccessDatabase && (
          <p className="info-message">
            🔒 Database access requires additional permissions.
          </p>
        )}
        {selectedDatabase && (
          <div className="selected-database">
            Selected Database: <strong>{selectedDatabase}</strong>
            {canAccessDatabase && (
              <button className="clear-btn" onClick={() => setSelectedDatabase(null)}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStructureViewer;