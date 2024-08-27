// NotificationContext.ts
// context/NotificationContext.ts
import * as React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import NotificationStore from '../components/state/stores/NotificationStore';

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationStore | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationStore = new NotificationStore();
  return (
    <NotificationContext.Provider value={notificationStore}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotificationStore = (): NotificationStore => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationStore must be used within a NotificationProvider');
  }
  return context;
};
