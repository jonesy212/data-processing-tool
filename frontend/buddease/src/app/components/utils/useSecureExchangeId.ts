import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { sanitizeData } from "../security/SanitizationFunctions";

export const useSecureExchangeId = () => {
  const [exchangeId, setExchangeId] = useState<number | null>(null); // Initialize exchangeId as null or number
  const [loadingError, setLoadingError] = useState<string | null>(null); // To handle loading errors
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExchangeId = async () => {
      if (isLoading) {
        console.log('Loading user authentication status...');
        return; // Early return if still loading
      }

      if (!isAuthenticated || !user) {
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        const fetchedExchangeId = user.exchangeId; // Assume `exchangeId` is a property on the `user` object

        if (typeof fetchedExchangeId === "number") {
          // Sanitize and set the exchange ID
          const sanitizedExchangeId = sanitizeData(String(fetchedExchangeId));
          setExchangeId(Number(sanitizedExchangeId));
          setLoadingError(null); // Clear any previous errors
        } else {
          throw new Error("Invalid exchange ID fetched.");
        }
      } catch (error) {
        console.error("Error fetching exchange ID:", error);
        setLoadingError("Failed to load content. Please try again later.");
        navigate('/error'); // Redirect to an error page
      }
    };

    // Set a timeout to handle cases where loading takes too long
    const timer = setTimeout(() => {
      if (isLoading || !exchangeId) {
        setLoadingError("Loading is taking longer than expected. Please refresh the page.");
        navigate('/error'); // Redirect to an error page or handle as needed
      }
    }, 10000); // 10 seconds timeout, adjust as needed

    // Call fetchExchangeId and clear the timeout if completed in time
    fetchExchangeId().finally(() => clearTimeout(timer));

  }, [isLoading, isAuthenticated, user, navigate]);

  // Optionally handle different states based on loadingError
  if (loadingError) {
    console.error(loadingError);
    // You could return an error message or component here if needed
  }

  return exchangeId;
};

export default useSecureExchangeId;
