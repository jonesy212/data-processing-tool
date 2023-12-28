import { ReactNode, createContext, useContext } from 'react';

export interface NotificationContextProps {
  sendNotification: (message: string) => void;
  sendSystemNotification: (message: string) => void;
  sendChatNotification: (message: string, userId: number) => void;
  // Add more notification functions as needed
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sendNotification = (message: string) => {
    // Handle the logic to display regular notifications
    console.log(`Notification: ${message}`);
  };

  const sendSystemNotification = (message: string) => {
    // Handle the logic to display system-wide notifications
    console.log(`System Notification: ${message}`);
  };

  const sendChatNotification = (message: string, userId: number) => {
    // Handle the logic to send chat notifications to a specific user
    console.log(`Chat Notification to User ${userId}: ${message}`);
  };

  return (
    <NotificationContext.Provider value={{ sendNotification, sendSystemNotification, sendChatNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
