//useSecureUserId.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';
import { useNavigate } from 'react-router-dom';
import UserRoles, { UserRoleEnum } from '../users/UserRoles';

export const useSecureUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const history = useNavigate(); // Used for redirection
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!isLoading && isAuthenticated && user) {
        try {
          // Extract userId from the user object
          const fetchedUserId = user.id;

          // Check if the user is authorized to access this userId
          // Assuming 'user' has a role or permissions property
            // Assuming 'user.role' is of type 'UserRoleEnum'
          if (user.role !== UserRoles.Administrator && fetchedUserId !== user.id) {
            throw new Error('Unauthorized access');
          
          }
          // Sanitize the fetched userId if necessary
          const sanitizedUserId =
            typeof fetchedUserId === "string" ? sanitizeData(fetchedUserId) : null;

          // Set the sanitized userId
          setUserId(sanitizedUserId);
        } catch (error: any) {
          // Handle errors appropriately
          setError(error.message);
          // Optionally redirect to a login page or show an error message
          history('/login'); // Redirect to login page
        }
      }
    };
    fetchUserId();
  }, [isLoading, isAuthenticated, user, history]);

  return { userId, error };
};