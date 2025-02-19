// useDocumentManagement.ts

import { useAuth } from "@/app/components/auth/AuthContext";
import useErrorHandling from "../hooks/useErrorHandling";
import axiosInstance from "../security/csrfToken";
import * as apiDocument from '../../../app/api/ApiDocument'
import useDocumentStore from "../state/stores/DocumentStore";

const useDocumentManagement = () => {
  const { handleError } = useErrorHandling();
  const { isAuthenticated, user } = useAuth();
  const documentStore = useDocumentStore(); // Initialize the document store


  const documents = async ()
  // fetchDocuments, getSnapshotDataKey, updateDocumentReleaseStatus




  const fetchDocumentContent = async (documentKey: string): Promise<string | null> => {
    try {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      // Check if the documentKey exists in user's documents
      const document = user?.yourDocuments?.[documentKey];
      if (!document) {
        throw new Error("Document not found");
      }

      // Check authorization based on document's access control rules
      if (document.isPrivate && !user.isAuthorized) {
        throw new Error("Unauthorized access");
      }
      // Fetch document content from backend
      const content = await fetchDocumentContentFromBackend(documentKey);

       // Optionally, add the fetched document to the store
       documentStore.addDocument(document, content); // Add content to the document
    
      return content;
    } catch (error: any) {
      handleError(error.message);
      return null;
    }
  };

 
const fetchDocumentContentFromBackend = async (documentKey: string): Promise<string> => {
  try {
    // Construct the URL for fetching the document content using apiDocument
    const url = apiDocument.getDocumentUrl(documentKey);

    // Make a GET request to fetch the document content
    const response = await axiosInstance.get<string>(await url);

    // Return the document content from the response
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error fetching document content:', error);
    throw new Error('Failed to fetch document content from backend');
  }
};

  return { fetchDocumentContent };
};

export default useDocumentManagement;
