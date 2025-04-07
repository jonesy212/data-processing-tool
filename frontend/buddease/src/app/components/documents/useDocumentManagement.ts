// useDocumentManagement.ts
import { useAuth } from "@/server/auth/AuthContext";
import useErrorHandling from "../hooks/useErrorHandling";
import axiosInstance from "../security/csrfToken";
import * as apiDocument from '../../../app/api/ApiDocument'
import useDocumentStore from "../state/stores/DocumentStore";
import { DocumentObject } from '@/app/components/state/redux/slices/DocumentSlice';

const useDocumentManagement = () => {
  const { handleError } = useErrorHandling();
  const { isAuthenticated, user } = useAuth();
  const documentStore = useDocumentStore(); // Initialize the document store

  const documents = async (): Promise<DocumentObject<any, any>[]> => {
    try {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
  
      const fetchedDocuments = await fetchUserDocuments(user.id); // Example function
      return fetchedDocuments;
    } catch (error) {
      handleError(error);
      return [];
    }
  };
   
  /**
   * Fetches documents belonging to the authenticated user.
   */
  const fetchDocuments = async (): Promise<DocumentObject<any, any>[]> => {
    try {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      // Fetch documents from backend
      const documents = await fetchUserDocuments(user.id); // Assume this API call exists

      // Store fetched documents in documentStore
      documentStore.setDocuments(documents);

      return documents;
    } catch (error: any) {
      handleError(error.message);
      return [];
    }
  };

  /**
   * Retrieves a unique snapshot key for a document.
   */
  const getSnapshotDataKey = (document: DocumentObject<any, any>): string => {
    try {
      if (!document || !document.id) {
        throw new Error("Invalid document");
      }

      return `snapshot-${document.id}`;
    } catch (error: any) {
      handleError(error.message);
      return "";
    }
  };

  /**
   * Updates the release status of a document.
   */
  const updateDocumentReleaseStatus = async (
    documentId: string | number,
    newStatus: string
  ): Promise<boolean> => {
    try {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      // Find the document in the store
      const document = documentStore.getDocument(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Update release status in backend
      await updateDocumentStatusInBackend(documentId, newStatus); // Assume API call exists

      // Update local store
      documentStore.updateDocument(documentId, { releaseStatus: newStatus });

      return true;
    } catch (error: any) {
      handleError(error.message);
      return false;
    }
  };


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
       documentStore.addDocument(document, { documentContent: content } as Content<any, any, any>);
    
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

  return { 
    documents,
    fetchDocumentContent,
    fetchDocuments,
    getSnapshotDataKey,
    updateDocumentReleaseStatus,
    fetchDocumentContentFromBackend,
   };
};

export default useDocumentManagement;
