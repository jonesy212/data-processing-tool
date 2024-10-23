import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import React from "react";
import { LogData } from "../models/LogData";
import { NotificationType, NotificationTypeEnum } from "./NotificationContext";

interface NotificationManagerProps {
  notifications: NotificationData[];
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  onConfirm: (message: string, randomBytes: any) => void; // Corrected spelling of onConfirm
  onCancel: (message: string, randomBytes: any) => void; // Corrected spelling of onCancel
}

class NotificationManager extends React.Component<NotificationManagerProps> {
  private notifications: NotificationData[] = [];

  // Method to get notifications
  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  // Method to add a notification
  addNotification(
    message: NotificationData,
    date: Date,
    // type: NotificationType,
    completionMessageLog: NotificationData,
    notificationType: NotificationType
  ): void {
    const newNotification: NotificationData = {
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
      completionMessageLog: {} as LogData,
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
export type { NotificationManagerProps };
