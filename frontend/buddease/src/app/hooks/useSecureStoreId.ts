// useSecureStoreId
import { sanitizeInput } from "@/app/components/crypto/SanitizationFunctions";
import { useAuth } from "@/state/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const useSecureStoreId = () => {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Enhanced sanitization function
  const sanitizeStoreId = (input: unknown): number | null => {
    if (input === null || input === undefined) {
      return null;
    }

    // Handle number type directly
    if (typeof input === 'number') {
      return input;
    }

    // Handle string type with proper sanitization
    if (typeof input === 'string') {
      const sanitized = sanitizeInput(input.trim());
      const num = Number(sanitized);
      return isNaN(num) ? null : num;
    }

    // Fallback for other types
    try {
      const sanitized = sanitizeInput(String(input));
      const num = Number(sanitized);
      return isNaN(num) ? null : num;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchStoreId = async () => {
      if (isLoading) {
        console.log('Loading user authentication status...');
        return;
      }

      if (!isAuthenticated || !user) {
        navigate('/login');
        return;
      }

      try {
        const fetchedStoreId = user.storeId;
        const sanitizedId = sanitizeStoreId(fetchedStoreId);

        if (sanitizedId === null) {
          throw new Error("Invalid store ID format");
        }

        // Additional validation
        if (sanitizedId <= 0) {
          throw new Error("Store ID must be positive");
        }

        setStoreId(sanitizedId);
        setLoadingError(null);
      } catch (error) {
        console.error("Error fetching store ID:", error);
        setLoadingError(
          error instanceof Error 
            ? error.message 
            : "Failed to load content. Please try again later."
        );
        navigate('/error');
      }
    };

    const timer = setTimeout(() => {
      if (isLoading || !storeId) {
        setLoadingError("Loading is taking longer than expected. Please refresh the page.");
        navigate('/error');
      }
    }, 10000);

    fetchStoreId().finally(() => clearTimeout(timer));

  }, [isLoading, isAuthenticated, user, navigate, storeId]);

  return { storeId, loadingError }; // Return both values as an object
};

export default useSecureStoreId;
