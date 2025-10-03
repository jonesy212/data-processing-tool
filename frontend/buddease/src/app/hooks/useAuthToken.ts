// useAuthToken.ts
// hooks/useAuthToken.ts
import { useState, useEffect } from 'react';

export const useAuthToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage, cookies, or context
    const token = localStorage.getItem('accessToken') || null;
    setAccessToken(token);
  }, []);

  return accessToken;
};
