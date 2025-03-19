import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import React from "react";
import { LogData } from "../models/LogData";
import { NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { T, K, Meta} from "@/app/components/models/data/dataStoreMethods";

type NotificationMessages = typeof NOTIFICATION_MESSAGES;

interface NotificationManagerProps {
  notifications: NotificationData<T, K, Meta<T, K<T>>>[];
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData<T, K, Meta<T, K<T>>>[]>>;
  onConfirm: (message: string, randomBytes: any) => void; // Corrected spelling of onConfirm
  onCancel: (message: string, randomBytes: any) => void; // Corrected spelling of onCancel
}

class NotificationManager extends React.Component<NotificationManagerProps> {
  private notifications: NotificationData<T, K<T>, Meta<T, K<T>>>[] = [];

  // Method to get notifications
  getNotifications(): NotificationData<T, K<T>, Meta<T, K<T>>>[] {
    return this.notifications;
  }

  // Method to add a notification
  addNotification(
    message: NotificationData<T, K<T>, Meta<T, K>>,
    date: Date,
    // type: NotificationType,
    completionMessageLog: NotificationData<T, K<T>, Meta<T, K>>,
    notificationType: NotificationType
  ): void {
    const newNotification: NotificationData<T, K<T>, Meta<T, K>> = {
      id: UniqueIDGenerator.generateNotificationID(
        message,
        date,
       NotificationTypeEnum.Info,
        completionMessageLog,
      ), // Corrected parameter type
      notificationType,
      createdAt: new Date(),
      date: new Date(),
      content: "",
      message: "",
      completionMessageLog: {} as LogData<T, K<T>, Meta>,
      sendStatus: "Sent",
    };
    this.notifications.push(newNotification);
  }

  // Method to clear notifications
  clearNotifications(): void {
    this.notifications = [];
  }

  // Methods for communication and collaboration options remain unchanged
}

export default NotificationManager;
export type { NotificationManagerProps, NotificationMessages };
