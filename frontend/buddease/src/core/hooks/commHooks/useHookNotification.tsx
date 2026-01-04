useHookNotification.tsx
useHookNotification.ts
import { NotificationContext, NotificationContextProps } from '@/core/state/context/NotificationContext';
import { useContext } from 'react';

export const useHookNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useHookNotification must be used within a NotificationProvider');
  }
  return context;
};
