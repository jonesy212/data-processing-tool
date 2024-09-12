import { Permission } from "./Permission";
import * as userApi from '../../api/UsersApi'
import * as documentApi from '../../api/ApiDocument'
// Example of admin function to assign permissions
const assignPermissions = (docId: string, userId: string, permissions: Permission[]) => {
  const user = userApi.getUserData(userId); // Function to fetch user by ID
  const document = documentApi.fetchDocumentByIdAPI(docId); // Function to fetch document by ID

  if (user && document) {
    document.permissions = permissions; // Assign the selected permissions
    saveDocument(document); // Save the updated document
  }
};