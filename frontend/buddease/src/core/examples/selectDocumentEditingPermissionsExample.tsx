selectDocumentEditingPermissionsExample.tsx
selectDocumentEditingPermissionsExample.ts

import { assignDocumentPermissions, canEditDocumentContent, selectDocumentEditingPermissions, useDocumentEditingPermissions } from "@/core/components/documents/selectDocumentEditingPermissions";
import { UserRoleEnum } from "@/core/models/UserRoles";

// Example 1: Check if user can edit document
const userRole = UserRoleEnum.CryptoAnalyst;
const documentType = "analysis_report";
const canEdit = canEditDocumentContent(userRole, documentType);
console.log(`Can edit: ${canEdit}`); // Output: Can edit: false

// Example 2: Get full permissions object
const permissions = selectDocumentEditingPermissions(
  UserRoleEnum.Administrator, 
  "project_document"
);
console.log(permissions.editLevel); // Output: FULL_ACCESS

// Example 3: Use in React component with the hook
const DocumentEditor = ({ userRole, documentType, isOwner }) => {
  const { canEdit, editLevel, canShare } = useDocumentEditingPermissions(
    userRole, 
    documentType, 
    isOwner
  );

  return (
    <div>
      {canEdit ? (
        <TextEditor 
          // ... props
          readOnly={editLevel === DocumentEditLevel.READ_ONLY}
        />
      ) : (
        <div>Read-only view</div>
      )}
    </div>
  );
};

// Example 4: Assign permissions to a user
await assignDocumentPermissions(
  "doc-123",
  "user-456",
  UserRoleEnum.RegionalManager,
  "project_plan"
);