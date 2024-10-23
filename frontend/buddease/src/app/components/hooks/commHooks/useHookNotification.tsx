// useHookNotification.ts
import { useContext } from 'react';
import { NotificationContext, NotificationContextProps } from '../../support/NotificationContext';

export const useHookNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useHookNotification must be used within a NotificationProvider');
  }
  return context;
};
