import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import React from "react";
import { Notification } from "./NofiticationsSlice";
import { NotificationType } from "./NotificationContext";

interface NotificationManagerProps {
  notifications: Notification[];
  notify: (message: string, randomBytes: any) => void; // Corrected spelling of notify
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onConfirm: (message: string, randomBytes: any) => void; // Corrected spelling of onConfirm
  onCancel: (message: string, randomBytes: any) => void; // Corrected spelling of onCancel
}

class NotificationManager extends React.Component<NotificationManagerProps> {
  private notifications: Notification[] = [];

  // Method to get notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Method to add a notification
  addNotification(
    message: Notification,
    date: Date,
    type: NotificationType
  ): void {
    const newNotification: Notification = {
      id: UniqueIDGenerator.generateNotificationID(message, date, type), // Corrected parameter type
      type,
      createdAt: new Date(),
      date: new Date(),
      content: "",
      message: "",
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
