// NotificationContext.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { createContext, useContext } from "react";
import { Notification } from "./NofiticationsSlice";
import NOTIFICATION_MESSAGES from "./NotificationMessages";
import { notificationStore } from "./NotificationProvider";


type CustomNotificationType = "RandomDismiss";

type NotificationType =
  | "Welcome"
  | "AccountCreated"
  | "Announcement"
  | "Error"
  | "Info"
  | "InvalidCredentials"
  | "TeamLoading"
  | "TeamJoinRequest"
  | "TeamJoinApproved"
  | "DataLoading"
  | "PageLoading"
  | "OperationSuccess"
  | "PaymentReceived"
  | "LowDiskSpace"
  | "DataLimitApproaching"
  | "NewFeatureAvailable"
  | "SystemUpdateInProgress"
  | "NewChatMessage"
  | "ChatMention"
  | "PushNotification"
  | "ProfileUpdated"
  | "PasswordChanged"
  | "EventReminder"
  | "EventOccurred"
  | "Dismiss"
  | "CustomNotification1"
  | "CustomNotification2"
  | "Ideation:Brainstorming"
  | "OperationError"
  | CustomNotificationType;

export interface NotificationContextProps {
  sendNotification: (
    type: NotificationType,
    userName?: string | number
  ) => void;
  addNotification: (notification: Notification) => void;
  notify: (
    message: string,
    content: any,
    date: Date | undefined,
    type: NotificationType
  ) => Promise<void>;

  notifications: Notification[];
  // Add more notification functions as needed
  showMessage: (message: string) => void;
}

const DefaultNotificationContext: NotificationContextProps = {
  sendNotification: () => {},
  addNotification: () => {},
  notify: (message, content, date, type) => {
    const notificationMessage = (NOTIFICATION_MESSAGES.Data.DEFAULT)[0] || message;
    content = { ...content, date };
    return new Promise((resolve) => {
      const id = UniqueIDGenerator.generateNotificationID;
      notificationStore.addNotification({
        id,
        content: notificationMessage,
        ...content
      });
      resolve();
    });
  },
  notifications: [],
  showMessage(message) {
    message = message || "Loading...";
  },
};

// Modify NotificationContextProps interface
export interface NotificationContextProps {
  sendNotification: (
    type: NotificationType,
    userName?: string | number
  ) => void;
  addNotification: (notification: Notification) => void;
  notify: (
    message: string,
    content: any,
    date: Date | undefined,
    type: NotificationType
  ) => Promise<void>;
  notifications: Notification[];
  // Add more notification functions as needed
}

export const NotificationContext = createContext<NotificationContextProps>(
  DefaultNotificationContext
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationStore = useContext(NotificationContext);

  const addNotification = (notification: Notification) => {
    notificationStore?.addNotification(notification);
  };

  const notify = (type: NotificationType, userName?: string | number) => {
    sendNotification(type, userName);
  };

  const sendNotification = (
    type: NotificationType,
    userName?: string | number
  ) => {
    const message = generateNotificationMessage(type, userName);

    if (notificationStore) {
      const notification = {
        id: Date.now().toString(),
        content: message,
        date: new Date(),
      };
      notificationStore?.addNotification(
        notification as unknown as Notification
      );
      console.log(`Notification: ${message}`);
    } else {
      console.error("NotificationStore is undefined");
    }
  };

  const generateNotificationMessage = (
    type: NotificationType,
    userName?: string | number
  ): string => {
    // Access the centralized NOTIFICATION_MESSAGES
    const messages = (
      NOTIFICATION_MESSAGES as unknown as Record<string, Record<string, string>>
    )[type];

    if (messages) {
      const { DEFAULT } = messages as unknown as {
        DEFAULT: (userName: string) => string;
      };

      // Check if there's a custom message function
      if (typeof DEFAULT === "function") {
        return DEFAULT(userName as string);
      }

      // Return the default message
      return DEFAULT;
    } else {
      return "Unknown Notification Type";
    }
  };

  return (
    <NotificationContext.Provider
      value={notificationStore || DefaultNotificationContext}
    >
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

  return {
    sendNotification: context.sendNotification,
    addNotification: context.addNotification,
    notify: context.notify,
    notifications: context.notifications || [],
    showMessage: context.showMessage
  };
};

export type { NotificationType };
