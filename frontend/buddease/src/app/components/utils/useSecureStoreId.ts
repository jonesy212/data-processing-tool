// useSecureStoreId
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { sanitizeData } from "../security/SanitizationFunctions";
import { useNavigate } from "react-router-dom";

export const useSecureStoreId = () => {
  const [storeId, setStoreId] = useState<number | null>(null); // Initialize storeId as null or number
  const [loadingError, setLoadingError] = useState<string | null>(null); // To handle loading errors
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreId = async () => {
      if (isLoading) {
        console.log('Loading user authentication status...');
        return; // Early return if still loading
      }

      if (!isAuthenticated || !user) {
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        const fetchedStoreId = user.storeId; // Assume `storeId` is a property on the `user` object

        if (typeof fetchedStoreId === "number") {
          // Sanitize and set the store ID
          const sanitizedStoreId = sanitizeData(String(fetchedStoreId));
          setStoreId(Number(sanitizedStoreId));
          setLoadingError(null); // Clear any previous errors
        } else {
          throw new Error("Invalid store ID fetched.");
        }
      } catch (error) {
        console.error("Error fetching store ID:", error);
        setLoadingError("Failed to load content. Please try again later.");
        navigate('/error'); // Redirect to an error page
      }
    };

    // Set a timeout to handle cases where loading takes too long
    const timer = setTimeout(() => {
      if (isLoading || !storeId) {
        setLoadingError("Loading is taking longer than expected. Please refresh the page.");
        navigate('/error'); // Redirect to an error page or handle as needed
      }
    }, 10000); // 10 seconds timeout, adjust as needed

    // Call fetchStoreId and clear the timeout if completed in time
    fetchStoreId().finally(() => clearTimeout(timer));

  }, [isLoading, isAuthenticated, user, navigate]);

  // Optionally handle different states based on loadingError
  if (loadingError) {
    console.error(loadingError);
    // You could return an error message or component here if needed
  }

  return storeId;
};

export default useSecureStoreId;
