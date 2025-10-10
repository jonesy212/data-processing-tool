import { NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { Attachment } from "@/app/documents/attachment/Attachment";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { LogData } from "@/app/models/LogData";
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import React from "react";

type NotificationMessages = typeof NOTIFICATION_MESSAGES;

interface NotificationManagerProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  setNotifications: React.Dispatch<
    React.SetStateAction<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  >;
  onConfirm: (message: string, randomBytes: any) => void;
  onCancel: (message: string, randomBytes: any) => void;
}

class NotificationManager<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends React.Component<NotificationManagerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  private notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

  // Method to get notifications
  getNotifications(): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.notifications;
  }

  // Method to add a notification
  addNotification(
    messageData: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    date: Date = new Date(),
    notificationType: NotificationTypeEnum = NotificationTypeEnum.INFO,
    completionMessageLog?: LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    const newNotification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      // Core required properties
      id: UniqueIDGenerator.generateNotificationID(
        messageData.message || '',
        date,
        notificationType,
        completionMessageLog,
      ),
      message: messageData.message || '',
      type: messageData.type || 'info',
      timestamp: date,
      read: false,

      // Notification specific properties
      notificationType: notificationType,
      createdAt: new Date(),
      date: date,
      content: messageData.content || '',
      completionMessageLog: completionMessageLog,
      sendStatus: "Sent" as SendStatus,

      // Data properties
      topics: messageData.topics || [],
      highlights: messageData.highlights || [],
      files: messageData.files || [],
      meta: messageData.meta || {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

      // CalendarEvent properties
      rsvpStatus: messageData.rsvpStatus || "notResponded",
      participants: messageData.participants || {},
      teamMemberId: messageData.teamMemberId || "",

      // Optional properties
      dataId: messageData.dataId,
      error: messageData.error,
      updatedAt: messageData.updatedAt,
      email: messageData.email,
      status: messageData.status,
      inApp: messageData.inApp,
      metadata: messageData.metadata,
      options: messageData.options,

      // Spread any additional properties from messageData
      ...messageData
    };

    this.notifications.push(newNotification);
    
    // Update parent component state if setNotifications is provided
    if (this.props.setNotifications) {
      this.props.setNotifications(prev => [...prev, newNotification]);
    }
  }

  // Method to mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.updatedAt = new Date();
    }
  }

  // Method to remove notification
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    
    if (this.props.setNotifications) {
      this.props.setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }

  // Method to clear all notifications
  clearNotifications(): void {
    this.notifications = [];
    
    if (this.props.setNotifications) {
      this.props.setNotifications([]);
    }
  }

  // Method to get unread notifications
  getUnreadNotifications(): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.notifications.filter(notification => !notification.read);
  }

  // Method to update notification
  updateNotification(
    notificationId: string, 
    updates: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex] = {
        ...this.notifications[notificationIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      if (this.props.setNotifications) {
        this.props.setNotifications([...this.notifications]);
      }
    }
  }

  // Communication and collaboration methods
  handleConfirm(message: string, randomBytes: any): void {
    this.props.onConfirm(message, randomBytes);
  }

  handleCancel(message: string, randomBytes: any): void {
    this.props.onCancel(message, randomBytes);
  }
}

export default NotificationManager;
export type { NotificationManagerProps, NotificationMessages };
