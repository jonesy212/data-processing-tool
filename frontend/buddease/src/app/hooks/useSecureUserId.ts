// useSecureUserId.ts
//useSecureUserId.ts
import UserRoles from '@/app/models/UserRoles';
import { useAuth } from '@/app/state/context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput } from '@/app/models/cypto/SanitizationFunctions'

export const useSecureUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const history = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!isLoading && isAuthenticated && user) {
        try {
          const fetchedUserId = user.id;

          if (user.role !== UserRoles.Administrator && fetchedUserId !== user.id) {
            throw new Error('Unauthorized access');
          }
          
          // Use sanitizeInput or sanitize for strings
          const sanitizedUserId = 
            typeof fetchedUserId === "string" ? sanitizeInput(fetchedUserId) : null;

          setUserId(sanitizedUserId); // Now properly typed as string | null
        } catch (error: any) {
          setError(error.message);
          history('/login');
        }
      }
    };
    fetchUserId();
  }, [isLoading, isAuthenticated, user, history]);

  return { userId, error };
};