//useSecureUserId.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';

export const useSecureUserId = () => {
  const [userId, setUserId] = useState<string | null>(null); // Initialize userId as null or string, depending on your use case
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      if (!isLoading && isAuthenticated && user) {
        // Here, you can perform additional checks to ensure that the user is authorized to access the userId
        // For example, you can check if the userId belongs to the authenticated user or if the user has admin privileges
        // If the user is not authorized, you can handle it accordingly (e.g., redirecting to a login page, displaying an error message)

        // Extract userId from the user object
        const fetchedUserId = user.id;

        // Sanitize the fetched userId if necessary (replace with your actual sanitization function)
        const sanitizedUserId =
          typeof fetchedUserId === "string" ? sanitizeData(fetchedUserId) : "";

        setUserId(sanitizedUserId);
      }
    };

    fetchUserId();
  }, [isLoading, isAuthenticated, user]);

  return userId;
};
