// NotificationContext.tsx
import { ReactNode, createContext, useContext } from "react";
import NotificationMessagesFactory from "./NotificationMessagesFactory";

export interface NotificationContextProps {
  sendNotification: (type: string, userName?: string | number) => void;
  // Add more notification functions as needed
}

export const NotificationContext = createContext<
  NotificationContextProps | undefined
>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);
    // Handle the logic to display notifications
    console.log(`Notification: ${message}`);
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
    <NotificationContext.Provider value={{ sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
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

  return notify;
};
