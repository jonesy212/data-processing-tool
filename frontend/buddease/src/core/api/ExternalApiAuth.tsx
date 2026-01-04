ExternalApiAuth.tsx
components/users/ExternalApiAuth.ts
"use client";

import { sendNotification } from '@/core/state/redux/slices/UserSlice';
import { useState } from "react";
import { useDispatch } from "react-redux";
export const useExternalApiAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const authenticateWithWix = async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/external/wix/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error('Wix authentication failed');
      
      const data = await response.json();
      dispatch(sendNotification("Successfully authenticated with Wix API"));
      return data;
    } catch (error) {
      dispatch(sendNotification(`Wix authentication failed: ${error}`));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { authenticateWithWix, isLoading };
};

Usage in components:
export function WixAuthComponent() {
  const { authenticateWithWix, isLoading } = useExternalApiAuth();

  const handleAuth = async () => {
    try {
      const result = await authenticateWithWix({ /* credentials */ });
      console.log('Success:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <button onClick={handleAuth} disabled={isLoading}>
      {isLoading ? 'Authenticating...' : 'Connect Wix'}
    </button>
  );
}