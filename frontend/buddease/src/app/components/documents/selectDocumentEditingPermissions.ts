// selectDocumentEditingPermissions.ts
import { UserRoleEnum } from '@/app/models/UserRoles';
import { DocumentEditingPermissions } from "@/app/permissions/Permission";
import { Permission } from '@/app/permissions/Permission';
import { DocumentPermissions } from '@/app/typings/entities/DocumentEntity'

// Define document editing permission levels
export enum DocumentEditLevel {
  NONE = 'none',
  READ_ONLY = 'read_only',
  COMMENT = 'comment',
  SUGGEST_EDIT = 'suggest_edit',
  EDIT = 'edit',
  FULL_ACCESS = 'full_access'
}

// Main function to select document editing permissions based on user role and document type
export const selectDocumentEditingPermissions = (
  userRole: UserRoleEnum,
  documentType?: string,
  isDocumentOwner: boolean = false
): DocumentEditingPermissions => {
  
  // Base permissions for all roles
  const basePermissions: DocumentEditingPermissions = {
    canView: false,
    canEdit: false,
    canEditMetadata: false,
    canEditPermissions: false,
    canShareDocument: false,
    canDeleteDocument: false,
    canComment: false,
    canSuggestEdits: false,
    canApproveEdits: false,
    canExportDocument: false,
    canViewVersionHistory: false,
    canRestoreVersions: false,
    editLevel: DocumentEditLevel.NONE
  };

  // If user is document owner, grant full access
  if (isDocumentOwner) {
    return {
      ...basePermissions,
      canView: true,
      canEdit: true,
      canEditMetadata: true,
      canEditPermissions: true,
      canShareDocument: true,
      canDeleteDocument: true,
      canComment: true,
      canSuggestEdits: true,
      canApproveEdits: true,
      canExportDocument: true,
      canViewVersionHistory: true,
      canRestoreVersions: true,
      editLevel: DocumentEditLevel.FULL_ACCESS
    };
  }

  // Role-based permissions
  switch (userRole) {
    case UserRoleEnum.Administrator:
      return {
        ...basePermissions,
        canView: true,
        canEdit: true,
        canEditMetadata: true,
        canEditPermissions: true,
        canShareDocument: true,
        canDeleteDocument: true,
        canComment: true,
        canSuggestEdits: true,
        canApproveEdits: true,
        canExportDocument: true,
        canViewVersionHistory: true,
        canRestoreVersions: true,
        editLevel: DocumentEditLevel.FULL_ACCESS
      };

    case UserRoleEnum.BlockchainAdmin:
      return {
        ...basePermissions,
        canView: true,
        canEdit: true,
        canEditMetadata: true,
        canEditPermissions: false,
        canShareDocument: true,
        canDeleteDocument: false,
        canComment: true,
        canSuggestEdits: true,
        canApproveEdits: true,
        canExportDocument: true,
        canViewVersionHistory: true,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.EDIT
      };

    case UserRoleEnum.RegionalManager:
      return {
        ...basePermissions,
        canView: true,
        canEdit: true,
        canEditMetadata: false,
        canEditPermissions: false,
        canShareDocument: true,
        canDeleteDocument: false,
        canComment: true,
        canSuggestEdits: true,
        canApproveEdits: false,
        canExportDocument: true,
        canViewVersionHistory: true,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.SUGGEST_EDIT
      };

    case UserRoleEnum.CryptoAnalyst:
      return {
        ...basePermissions,
        canView: true,
        canEdit: false,
        canEditMetadata: false,
        canEditPermissions: false,
        canShareDocument: false,
        canDeleteDocument: false,
        canComment: true,
        canSuggestEdits: true,
        canApproveEdits: false,
        canExportDocument: true,
        canViewVersionHistory: true,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.SUGGEST_EDIT
      };

    case UserRoleEnum.LegalAdvisor:
      return {
        ...basePermissions,
        canView: true,
        canEdit: false,
        canEditMetadata: false,
        canEditPermissions: false,
        canShareDocument: false,
        canDeleteDocument: false,
        canComment: true,
        canSuggestEdits: true,
        canApproveEdits: false,
        canExportDocument: true,
        canViewVersionHistory: true,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.COMMENT
      };

    case UserRoleEnum.CustomerSupport:
      return {
        ...basePermissions,
        canView: true,
        canEdit: false,
        canEditMetadata: false,
        canEditPermissions: false,
        canShareDocument: false,
        canDeleteDocument: false,
        canComment: true,
        canSuggestEdits: false,
        canApproveEdits: false,
        canExportDocument: false,
        canViewVersionHistory: false,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.COMMENT
      };

    case UserRoleEnum.CryptoInvestor:
      return {
        ...basePermissions,
        canView: true,
        canEdit: false,
        canEditMetadata: false,
        canEditPermissions: false,
        canShareDocument: false,
        canDeleteDocument: false,
        canComment: false,
        canSuggestEdits: false,
        canApproveEdits: false,
        canExportDocument: false,
        canViewVersionHistory: false,
        canRestoreVersions: false,
        editLevel: DocumentEditLevel.READ_ONLY
      };

    default:
      return basePermissions;
  }
};

// Helper function to check if user can edit specific document content
export const canEditDocumentContent = (
  userRole: UserRoleEnum,
  documentType: string,
  isDocumentOwner: boolean = false
): boolean => {
  const permissions = selectDocumentEditingPermissions(userRole, documentType, isDocumentOwner);
  return permissions.canEdit;
};

// Helper function to check if user can share document
export const canShareDocument = (
  userRole: UserRoleEnum,
  documentType: string,
  isDocumentOwner: boolean = false
): boolean => {
  const permissions = selectDocumentEditingPermissions(userRole, documentType, isDocumentOwner);
  return permissions.canShare;
};

// Function to convert DocumentEditingPermissions to DocumentPermissions class
export const convertToDocumentPermissions = (
  editingPermissions: DocumentEditingPermissions
): DocumentPermissions => {
  return new DocumentPermissions(
    editingPermissions.canView,
    editingPermissions.canEdit
  );
};

// Function to check TextEditor access based on permissions
export const getTextEditorAccess = (
  userRole: UserRoleEnum,
  documentType: string,
  isDocumentOwner: boolean = false
): { canEdit: boolean; editLevel: DocumentEditLevel } => {
  const permissions = selectDocumentEditingPermissions(userRole, documentType, isDocumentOwner);
  
  return {
    canEdit: permissions.canEdit,
    editLevel: permissions.editLevel
  };
};

// Integration with your existing assignPermissions function
export const assignDocumentPermissions = async (
  docId: string,
  userId: string,
  userRole: UserRoleEnum,
  documentType: string,
  isOwner: boolean = false
): Promise<void> => {
  try {
    const editingPermissions = selectDocumentEditingPermissions(userRole, documentType, isOwner);
    
    // Convert to Permission array for your existing system
    const permissions: Permission[] = [];
    
    if (editingPermissions.canView) {
      permissions.push({ permissionType: 'read', granted: true });
    }
    
    if (editingPermissions.canEdit) {
      permissions.push({ permissionType: 'write', granted: true });
    }
    
    if (editingPermissions.canComment) {
      permissions.push({ permissionType: 'comment', granted: true });
    }
    
    if (editingPermissions.canShareDocument) {
      permissions.push({ permissionType: 'share', granted: true });
    }

    // Use your existing assignPermissions function
    await assignPermissions(docId, userId, permissions);
    
  } catch (error) {
    console.error("Error assigning document permissions:", error);
    throw error;
  }
};

// Hook for React components to check document editing permissions
export const useDocumentEditingPermissions = (
  userRole: UserRoleEnum,
  documentType: string,
  isDocumentOwner: boolean = false
) => {
  const permissions = selectDocumentEditingPermissions(userRole, documentType, isDocumentOwner);
  
  return {
    permissions,
    canEdit: permissions.canEdit,
    canView: permissions.canView,
    canShare: permissions.canShareDocument,
    canDelete: permissions.canDeleteDocument,
    editLevel: permissions.editLevel
  };
};