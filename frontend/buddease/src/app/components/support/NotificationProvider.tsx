// NotificationProvider.tsx
import React, { ReactNode, createContext } from 'react';
import NotificationMessagesFactory from './NotificationMessagesFactory';
import {
  useAppDispatch,
  import
} from { addNotification };
from '../calendar/CalendarSlice';

export interface NotificationContextProps {
  sendNotification: (type: string, userName?: string | number) => void;
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch(); // Redux store dispatch function

  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);
    // Dispatch an action to add the notification to the store
    dispatch(addNotification({ id: Date.now().toString(), message }));
  };

  const generateNotificationMessage = (type: string, userName?: string | number): string => {
    switch (type) {
      case 'Welcome':
        return NotificationMessagesFactory.createWelcomeMessage(userName as string);
      case 'Error':
        return NotificationMessagesFactory.createErrorMessage(userName as string);
      case 'Custom':
        return NotificationMessagesFactory.createCustomMessage(userName as string);
      default:
        return 'Unknown Notification Type';
    }
  };

  return (
    <NotificationContext.Provider value={{ sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
