// useSecureAccountId.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';
import { TwitterIntegration } from '../socialMedia/TwitterIntegration';

export const useSecureAccountId = () => {
  const [accountId, setAccountId] = useState<string | null>(null); // Initialize accountId as null or string, depending on your use case
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const fetchAccountId = async () => {
      if (!isLoading && isAuthenticated && user) {
        // Here, you can perform additional checks to ensure that the user is authorized to access the accountId
        // For example, you can check if the accountId belongs to the authenticated user or if the user has admin privileges
        // If the user is not authorized, you can handle it accordingly (e.g., redirecting to a login page, displaying an error message)

        // Extract accountId from the TwitterIntegration class
        const fetchedAccountId = await TwitterIntegration.fetchAccountId(user); // Assuming TwitterIntegration has a method to fetch accountId

        // Sanitize the fetched accountId if necessary (replace with your actual sanitization function)
        const sanitizedAccountId =
          typeof fetchedAccountId === "string" ? sanitizeData(fetchedAccountId) : "";

        setAccountId(sanitizedAccountId);
      }
    };

    fetchAccountId();
  }, [isLoading, isAuthenticated, user]);

  return accountId;
};
