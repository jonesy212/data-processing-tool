// useRegistration.ts
// app/features/registration/hooks/useRegistration.ts
import { useNotification } from '@/app/state/contexts/NotificationContext';
import { useState } from 'react';

export const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotification();

  const register = async (userData: any): Promise<any> => {
    setIsLoading(true);
    try {
      // Your registration API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      notify('Registration failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
};