// useErrorHandling.tsx
import { useState } from 'react';

const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Optionally, you can log the error or perform other actions here
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

export default useErrorHandling;
