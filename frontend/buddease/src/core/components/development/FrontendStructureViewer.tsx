// FrontendStructureViewer.tsx
// FrontendStructureViewer with action-level permission checks
import { useCurrentUser, useRoleAccess } from '@/core/hooks/useRoleAccess';
import type { UserRole } from '@/core/models/UserRole';
import type { UserRoleEnum } from '@/core/models/UserRoles';
import UserRoles from '@/core/models/UserRoles';
import AccessDenied from '@/core/pages/AccessDenied';
import React, { useState } from 'react';

interface FrontendStructureViewerProps {
  frontendStructure: any
  showSensitiveFiles?: boolean;
  onEditRequest?: (fileName: string) => void;
  onMoveRequest?: (fileName: string) => void;
}

const FrontendStructureViewer: React.FC<FrontendStructureViewerProps> = ({ 
  frontendStructure,
  showSensitiveFiles = false,
  onEditRequest,
  onMoveRequest
}) => {
  const { userRole, isLoading: userLoading } = useCurrentUser();
  const [showActionDenied, setShowActionDenied] = useState<string | null>(null);
  
  // Check permissions using useRoleAccess
  const { hasAccess: canView, isLoading: viewLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'view:frontend-structure'
  });

  const { hasAccess: canEdit, isLoading: editLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'modify:file-structure'
  });

  const { hasAccess: canManage, isLoading: manageLoading } = useRoleAccess({
    userRole,
    requiredPermission: 'manage:file-structure'
  });

  const isLoading = userLoading || viewLoading || editLoading || manageLoading;

  const handleEdit = (fileName: string) => {
    if (!canEdit) {
      setShowActionDenied('edit');
      return;
    }
    onEditRequest?.(fileName);
  };

  const handleMove = (fileName: string) => {
    if (!canManage) {
      setShowActionDenied('manage');
      return;
    }
    onMoveRequest?.(fileName);
  };

  const handleEditStructure = () => {
    if (!canEdit) {
      setShowActionDenied('edit-structure');
      return;
    }
    console.log('Edit structure mode activated');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Checking access permissions...</p>
      </div>
    );
  }

  // Show access denied if user cannot view frontend structure
  if (!canView) {
    const allowedRoles: UserRole[] = [
      UserRoles[UserRoleEnum.UXUIDesigner],
      UserRoles[UserRoleEnum.Developer],
      UserRoles[UserRoleEnum.Administrator],
      UserRoles[UserRoleEnum.System],
      UserRoles[UserRoleEnum.Contributor],
      UserRoles[UserRoleEnum.Editor]
    ];

    return (
      <AccessDenied 
        feature="Frontend Structure Viewer"
        requiredRole={allowedRoles}
        userRole={userRole}
        message={`You need permission to view frontend structure files. Your current role (${userRole}) does not have sufficient permissions.`}
        type="permission"
        userContext={{
          username: "Current User", // Replace with actual username from your auth
          roles: userRole
        }}
        showHelpText={true}
        customActions={[
          { 
            label: 'Request Access', 
            onClick: () => window.location.href = '/request-access?feature=frontend-structure',
            primary: true 
          },
          { 
            label: 'Go to Dashboard', 
            onClick: () => window.location.href = '/dashboard'
          },
          { 
            label: 'Contact Admin', 
            onClick: () => window.location.href = '/contact-admin',
            secondary: true 
          }
        ]}
      />
    );
  }

  // Show action-level permission denied
  if (showActionDenied) {
    const actionMessages = {
      'edit': 'edit files in the frontend structure',
      'manage': 'move or manage files in the frontend structure', 
      'edit-structure': 'edit the overall frontend structure'
    };

    const requiredPermissions = {
      'edit': 'modify:file-structure',
      'manage': 'manage:file-structure',
      'edit-structure': 'modify:file-structure'
    };

    // For action-level denied, use UserRole objects
    const requiredRoles: UserRole[] = [
      UserRoles[UserRoleEnum.Developer],
      UserRoles[UserRoleEnum.Administrator],
      UserRoles[UserRoleEnum.System]
    ];

    return (
      <AccessDenied 
        feature={`Ability to ${actionMessages[showActionDenied as keyof typeof actionMessages]}`}
        requiredRole={requiredRoles}
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
            label: 'Request Edit Permissions', 
            onClick: () => window.location.href = `/request-permission?permission=${requiredPermissions[showActionDenied as keyof typeof requiredPermissions]}`,
            secondary: true 
          }
        ]}
      />
    );
  }

  const structure = frontendStructure.getStructure();
  
  // Filter structure entries based on permissions and sensitive file settings
  const structureEntries = Object.entries(structure).filter(
    ([_, fileInfo]) => {
      // fileInfo is now strongly typed
      if (fileInfo.isSensitive && !canEdit && !showSensitiveFiles) {
        return false;
      }
      return true;
    }
  );

  // Determine access level for display
  const getAccessLevel = () => {
    if (canManage) return 'Full Access';
    if (canEdit) return 'Edit Access';
    return 'View Only';
  };

  return (
    <div className="frontend-structure-viewer">
      <div className="viewer-header">
        <h2>Frontend File Structure</h2>
        <div className="viewer-controls">
          <span className="access-level">
            Role: <strong>{userRole}</strong> | Access: <strong>{getAccessLevel()}</strong>
          </span>
          {canEdit && (
            <div className="action-buttons">
              <button 
                className="edit-btn"
                onClick={handleEditStructure}
              >
                Edit Structure
              </button>
              {showSensitiveFiles && (
                <span className="sensitive-warning">🔒 Sensitive Files Visible</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Structure Statistics */}
      <div className="structure-stats">
        <span>Total Files: {structureEntries.length}</span>
        {structureEntries.some(([_, fileInfo]) => fileInfo.isSensitive) && (
          <span className="sensitive-count">
            Sensitive Files: {structureEntries.filter(([_, fileInfo]) => fileInfo.isSensitive).length}
          </span>
        )}
      </div>
      
      <div className="structure-list">
        {structureEntries.length === 0 ? (
          <div className="empty-state">
            <p>No files to display.</p>
            {!showSensitiveFiles && structureEntries.length === 0 && (
              <p>Some files may be hidden due to sensitivity settings.</p>
            )}
          </div>
        ) : (
          structureEntries.map(([fileName, fileInfo]) => (
            <div 
              key={fileName} 
              className={`file-item ${fileInfo.isSensitive ? 'sensitive' : ''}`}
            >
              <div className="file-header">
                <div className="file-info">
                  <strong className="file-name">{fileName}</strong>
                  {fileInfo.isSensitive && (
                    <span className="sensitive-badge" title="Contains sensitive information">
                      🔒 Sensitive
                    </span>
                  )}
                  {fileInfo.type && (
                    <span className="file-type">{fileInfo.type}</span>
                  )}
                </div>
                
                {/* File actions for authorized users */}
                {(canEdit || canManage) && (
                  <div className="file-actions">
                    {canEdit && (
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(fileName)}
                        title="Edit file"
                      >
                        Edit
                      </button>
                    )}
                    {canManage && (
                      <button 
                        className="action-btn move"
                        onClick={() => handleMove(fileName)}
                        title="Move file"
                      >
                        Move
                      </button>
                    )}
                  </div>
                )}
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
                
                {/* Additional file metadata */}
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

      {/* Permission-based footer */}
      <div className="viewer-footer">
        {!canEdit && (
          <p className="info-message">
            💡 You have view-only access. Contact an administrator for edit permissions.
          </p>
        )}
        {canEdit && !canManage && (
          <p className="info-message">
            💡 You can edit files but cannot move or delete them.
          </p>
        )}
      </div>
    </div>
  );
};

export default FrontendStructureViewer;