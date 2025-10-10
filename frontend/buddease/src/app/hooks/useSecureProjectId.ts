// useSecureProjectId.ts
import UserRoles from '@/app/models/UserRoles';
import { useAuth } from '@/context/AuthContext';
import { sanitizeData } from '@/security/SanitizationFunctions';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Optional: You might pass projectId from route params or props
export const useSecureProjectId = (projectId: string | null) => {
  const [secureProjectId, setSecureProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateProjectAccess = async () => {
      if (!isLoading && isAuthenticated && user && projectId) {
        try {
          // Sanitize input projectId
          const sanitizedId = sanitizeData(projectId);

          // Authorization logic: Admins can access anything,
          // Others can only access if they are assigned to the project
          const isAdmin = user.role === UserRoles.Administrator;
          const hasProjectAccess = user.projects?.includes(sanitizedId);

          if (!isAdmin && !hasProjectAccess) {
            throw new Error('Unauthorized project access');
          }

          setSecureProjectId(sanitizedId);
        } catch (err: any) {
          setError(err.message || 'Error accessing project');
          navigate('/unauthorized'); // or /login or show toast
        }
      }
    };

    validateProjectAccess();
  }, [isLoading, isAuthenticated, user, projectId, navigate]);

  return { projectId: secureProjectId, error };
};
