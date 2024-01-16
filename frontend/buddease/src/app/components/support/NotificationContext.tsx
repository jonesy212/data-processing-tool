// NotificationContext.tsx
import { createContext, useContext } from "react";
import { Notification } from "./NofiticationsSlice";
import NOTIFICATION_MESSAGES from "./NotificationMessages";

type NotificationType = "Welcome" | "Success" | "Failure" | "Error";

// Modify NotificationContextProps interface
export interface NotificationContextProps {
  sendNotification: (type: NotificationType, userName?: string | number) => void;
  addNotification: (notification: Notification) => void;
  notify: (type: NotificationType, userName?: string | number | undefined) => void;
  notifications: Notification[];
  // Add more notification functions as needed
}
export const NotificationContext: React.Context<
  NotificationContextProps | undefined
> = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationStore = useContext(NotificationContext);


  const addNotification = (notification: Notification) => { 
    notificationStore?.addNotification(notification);
  }

  const notify = (type: string, userName?: string | number) => { 
    sendNotification(type, userName);

  }

  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);

    if (notificationStore) {
      const notification = { id: Date.now().toString(), content: message, date: new Date() };
      // Handle the logic to display notifications
      // Dispatch the addNotification action directly from your MobX store
      notificationStore?.addNotification(notification as Notification);
      console.log(`Notification: ${message}`);
    } else {
      console.error("NotificationStore is undefined");
    }
  };

  const generateNotificationMessage = (
    type: string,
    userName?: string | number
  ): string => {
    // Access the centralized NOTIFICATION_MESSAGES
    const messages = (NOTIFICATION_MESSAGES as unknown as Record<string, Record<string, string>>)[type];

    if (messages) {
      const { DEFAULT } = messages as unknown as { DEFAULT: (userName: string) => string };

      // Check if there's a custom message function
      if (typeof DEFAULT === 'function') {
        return DEFAULT(userName as string);
      }

      // Return the default message
      return DEFAULT;
    } else {
      return 'Unknown Notification Type';
    }
  };

  return (  
<NotificationContext.Provider value={notificationStore ? { sendNotification, addNotification, notify, notifications: [] } : undefined}>
    {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  const notify = (message: string, type: NotificationType) => {
    // You can add additional logic here if needed
    context.sendNotification(type, message);
  };

  return { sendNotification: context.sendNotification, addNotification: context.addNotification, notify: context.notify , notifications: context.notifications || [] };
};
