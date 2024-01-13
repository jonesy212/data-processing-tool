// NotificationContext.tsx
import { ReactNode, createContext, useContext } from "react";
import { Notification } from "./NofiticationsSlice";
import NotificationMessagesFactory from "./NotificationMessagesFactory";

export interface NotificationContextProps {
  sendNotification: (type: string, userName?: string | number) => void;
  addNotification: (notification: Notification) => void;
  notify: (type: string, userName?: string | number | undefined) => void
  // Add more notification functions as needed
}

export const NotificationContext = createContext<
  NotificationContextProps | undefined
>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
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
    switch (type) {
      case "Welcome":
        return NotificationMessagesFactory.createWelcomeMessage(
          userName as string
        );
      case "Success":
        return NotificationMessagesFactory.createSuccessMessage(
          userName as string
        );
      case "Failure":
        return NotificationMessagesFactory.createFailureMessage(
          userName as string
        );
      case "Error":
        return NotificationMessagesFactory.createErrorMessage(
          userName as string
        );
      case "TaskError":
        return NotificationMessagesFactory.createTaskErrorMessage(
          userName as string
        );
      case "TodoError":
        return NotificationMessagesFactory.createTodoErrorMessage(
          userName as string
        );
      case "NamingConventionsError":
        return NotificationMessagesFactory.createNamingConventionsErrorMessage(
          userName as string
        );
      // Add more cases for other notification types
      case "Custom":
        return NotificationMessagesFactory.createCustomMessage(
          userName as string
        );
      default:
        return "Unknown Notification Type";
    }
  };

  return (
    <NotificationContext.Provider value={{ sendNotification, addNotification, notify }}>
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

  const notify = (message: string, type: string) => {
    // You can add additional logic here if needed
    context.sendNotification(type, message);
  };

  return { sendNotification: context.sendNotification, addNotification: context.addNotification, notify: context.notify };
};
