import { setError } from '@/app/redux/slices/ErrorSlice';
import { setLoading } from '@/app/state/stores/UISlice';
// useDocumentManagement.ts
import { useAuth } from "@/context/AuthContext";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import axiosInstance from '@/app/api/csrfToken';
import * as apiDocument from '@/app/api/ApiDocument'
import useDocumentStore from "@/app/state/stores/DocumentStore";
import { DocumentObject } from '@/app/state/redux/slices/DocumentSlice';

const useDocumentManagement = () => {
  const { handleError } = useErrorHandling();
  const { isAuthenticated, user } = useAuth();
  const documentStore = useDocumentStore(); // Initialize the document store




  const generateDocument = async (
    type: string,
    options: DocumentOptions,
    fileContent?: string,
    documents?: DocumentData<BaseData<any>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, options, fileContent, documents }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentsList = async () => {
    try {
      const response = await fetch('/api/generate-document');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteDocument = async (fileName: string) => {
    try {
      const response = await fetch('/api/generate-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) throw new Error('Failed to delete document');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

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
        
    generateDocument,
    getDocumentsList,
    deleteDocument,
    loading,
    error,
   };
};

export default useDocumentManagement;
