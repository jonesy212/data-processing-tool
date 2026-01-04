assignPermissions.ts
import * as documentApi from '@/core/api/ApiDocument';
import * as userApi from '@/core/api/UsersApi';
import { saveDocument } from "@/core/documents/editing/DocumentBuilder";
import { Permission } from '@/core/permissions/Permission';

Example of admin function to assign permissions
const assignPermissions = async (docId: string, userId: string, permissions: Permission[]) => {
  try {
    // Fetch user and document asynchronously
    const user = await userApi.getUserData(userId);
    const document = await documentApi.fetchDocumentByIdAPI(
      parseInt(docId), 
      (draft) => {
        // Example update function, can customize
        draft.permissions = draft.permissions || {};
      }
    );

    if (document) {
      document.permissions = {
        _readAccess: permissions.filter(p => p.permissionType === 'read'),
        _writeAccess: permissions.filter(p => p.permissionType === 'write'),
        getReadAccess: () => document.permissions._readAccess,
        setReadAccess: (access: Permission[]) => { document.permissions._readAccess = access; },
        getWriteAccess: () => document.permissions._writeAccess,
        setWriteAccess: (access: Permission[]) => { document.permissions._writeAccess = access; },
      };
    }

    // Save the updated document if both user and document exist
    if (user && document) {
      await saveDocument(document);
    }
  } catch (error) {
    console.error("Error in assigning permissions:", error);
  }
};

export { assignPermissions };
