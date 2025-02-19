import { Permission } from "./Permission";
import * as userApi from '../../api/UsersApi'
import * as documentApi from '../../api/ApiDocument'
import { saveDocument } from "../documents/DocumentBuilder";
// Example of admin function to assign permissions
const assignPermissions = async (docId: string, userId: string, permissions: Permission[]) => {
  try {
    // Fetch user and document asynchronously
    const 
    const user = await userApi.getUserData(userId);
    const document = await documentApi.fetchDocumentByIdAPI(docId, documentApi.updateDocument);
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
    // Now you can work with the resolved document
    if (user && document) {
      // Save the updated document
      await saveDocument(document);
    }
  } catch (error) {
    console.error("Error in assigning permissions:", error);
  }
};