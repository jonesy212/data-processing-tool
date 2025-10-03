import { K, Meta, T } from "@/app/components/models/data/dataStoreMethods";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { LogData } from "@/app/models/LogData";
import React from "react";

type NotificationMessages = typeof NOTIFICATION_MESSAGES;

interface NotificationManagerProps {
  notifications: NotificationData<T, K, Meta<T, K>>[];
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData<T, K, Meta<T, K>>[]>>;
  onConfirm: (message: string, randomBytes: any) => void; // Corrected spelling of onConfirm
  onCancel: (message: string, randomBytes: any) => void; // Corrected spelling of onCancel
}

class NotificationManager extends React.Component<NotificationManagerProps> {
  private notifications: NotificationData<T, K, Meta<T, K>>[] = [];

  // Method to get notifications
  getNotifications(): NotificationData<T, K, Meta<T, K>>[] {
    return this.notifications;
  }

  // Method to add a notification
  addNotification(
    message: NotificationData<T, K, Meta<T, K>>,
    date: Date,
    // type: NotificationType,
    completionMessageLog: NotificationData<T, K, Meta<T, K>>,
    notificationType: NotificationType
  ): void {
    const newNotification: NotificationData<T, K, Meta<T, K>> = {
      id: UniqueIDGenerator.generateNotificationID(
        message,
        date,
       NotificationTypeEnum.INFO,
        completionMessageLog,
      ), // Corrected parameter type
      notificationType,
      createdAt: new Date(),
      date: new Date(),
      content: "",
      message: "",
      completionMessageLog: {} as LogData<T, K, Meta>,
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
