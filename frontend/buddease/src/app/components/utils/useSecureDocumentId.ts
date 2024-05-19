import { fetchDocumentById } from './../state/redux/slices/DocumentSlice';
// useSecureDocumentId.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';
import useDocumentStore from '../state/stores/DocumentStore';

export const useSecureDocumentId = () => {
  const [documentId, setDocumentId] = useState<string | null>(null); // Initialize documentId as null or string, depending on your use case
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const fetchDocumentId = async () => {
      if (!isLoading && isAuthenticated && user) {
        // Here, you can perform additional checks to ensure that the user is authorized to access the documentId
        // For example, you can check if the documentId belongs to the authenticated user or if the user has admin privileges
        // If the user is not authorized, you can handle it accordingly (e.g., redirecting to a login page, displaying an error message)

        // Extract documentId from the user object or any other source
        // Replace 'documentId' with the property name where the documentId is stored in the user object or any other source
        const fetchedDocumentId = user.yourDocuments?.public?.documentId;

        // Sanitize the fetched documentId if necessary (replace with your actual sanitization function)
        const sanitizedDocumentId = typeof fetchedDocumentId === 'string' ? sanitizeData(fetchedDocumentId) : '';

        setDocumentId(sanitizedDocumentId);
      }
    };

    fetchDocumentId();
  }, [isLoading, isAuthenticated, user]);

  return documentId;
};
