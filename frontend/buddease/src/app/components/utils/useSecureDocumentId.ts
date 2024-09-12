import { fetchDocumentById } from './../state/redux/slices/DocumentSlice';
// useSecureDocumentId.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';
import useDocumentStore, { Document } from '../state/stores/DocumentStore';
import UserRoles, { UserRoleEnum } from '../users/UserRoles';
import { useNavigate } from 'react-router-dom';
import { DocumentNode } from '../users/User';
import { Permission } from '../users/Permission';


export const useSecureDocumentId = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocumentId = async () => {
      if (!isLoading && isAuthenticated && user) {
        const fetchedDocumentId = user.yourDocuments?.public?.documentId;

        if (!fetchedDocumentId) {
          console.error('Document ID is not available.');
          navigate('/error');
          return;
        }

        const sanitizedDocumentId = typeof fetchedDocumentId === 'string'
          ? sanitizeData(fetchedDocumentId) : '';

        const hasAccess = checkDocumentAccess(sanitizedDocumentId, 'read')
        if (!hasAccess) {
          navigate('/access-denied');
          return;
        }

        setDocumentId(sanitizedDocumentId);
      } else if (isLoading) {
        console.log('Loading user authentication status...');
      } else if (!isAuthenticated) {
        navigate('/login');
      }
    };
    fetchDocumentId();
  }, [isLoading, isAuthenticated, user, navigate]);

  const checkDocumentAccess = (docId: string, action: string): boolean => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated || !user) {
      return false;
    }

    // Correctly type the document variable to match your custom document structure
    const document: DocumentNode | undefined = user.yourDocuments?.[docId];

    if (!document) {
      return false;
    }

    const userRole = user.role;

    if (document.isPrivate) {
      if (userRole === UserRoles.Administrator) {
        return true;
      }

      if (document.requiredRole && userRole !== UserRoles[document.requiredRole as keyof typeof UserRoleEnum]) {
        return false;
      }
    }

    // Check if the user has the required permission for the action
    if (document.permissions && Array.isArray(document.permissions) && !document.permissions.includes(action.toString())) {
      return false;
    }

    return true;
  }; return documentId;
};

export default useSecureDocumentId;

