import { apiNotificationMessages } from "@/app/api/ApiData";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import { LogData } from "@/app/models/LogData";
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/state/context/NotificationContext";
import { AxiosError } from 'axios';
import { observer } from "mobx-react";
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
    messageKey: keyof NotificationMessages,
    data?: any,
    date?: Date,
    type?: NotificationType
  ) => void;

 setNotifications?: (
    updater: (
      prev: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => void;

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
> extends React.Component<
  NotificationManagerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
> {
  private notifier: ReturnType<typeof useNotification<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  private notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  constructor(
    props: NotificationManagerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    super(props);

    // Use dependency injection or static assignment.
    this.notifier = useNotification<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    this.notifications = props.notifications || [];
  }

  // =====================================================
  // 🔹 Generic Notification Handlers
  // =====================================================

  notify(
    id: string,
    messageKey: keyof NotificationMessages,
    data?: any,
    date: Date = new Date(),
    type: NotificationType = NotificationTypeEnum.INFO
  ): void {
    if (type === NotificationTypeEnum.SUCCESS) {
      this.notifier.showSuccessNotification({
        id,
        message: String(messageKey),
        data,
        timestamp: date,
      });
    } else if (type === NotificationTypeEnum.ERROR) {
      this.notifier.showErrorNotification({
        id,
        message: String(messageKey),
        data,
        timestamp: date,
      });
    } else {
      this.notifier.showInfoNotification({
        id,
        message: String(messageKey),
        data,
        timestamp: date,
      });
    }
  }

  notifySuccess(id: string, message: string, data: any = null): void {
    this.notifier.showSuccessNotification({
      id,
      message,
      data,
      timestamp: new Date(),
    });
  }

  notifyError(id: string, message: string, data?: any): void {
    this.notifier.showErrorNotification({
      id,
      message,
      data,
      timestamp: new Date(),
    });
  }

  // =====================================================
  // 🔹 Context-Aware API Error Handler
  // =====================================================

  handleApiErrorAndNotify<Ctx extends string>(
    context: Ctx,
    error: AxiosError<unknown>,
    errorMessage: string,
    errorMessageId: keyof NotificationMessages
  ): void {
    console.error(`[${context}] API Error:`, errorMessage, error);

    const errorMessageText =
      apiNotificationMessages?.[context]?.[errorMessageId] ??
      apiNotificationMessages?.[errorMessageId] ??
      errorMessage;

    this.notifier.showErrorNotification({
      id: `${context}-${String(errorMessageId)}`,
      message: errorMessageText,
      data: { context, originalError: errorMessage },
      timestamp: new Date(),
    });
  }

  // =====================================================
  // 🔹 Notification CRUD Operations
  // =====================================================

  getNotifications(): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.notifications;
  }

  addNotification(
    messageData: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    date: Date = new Date(),
    notificationType: NotificationType = NotificationTypeEnum.INFO,
    completionMessageLog?: LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    const newNotification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: UniqueIDGenerator.generateNotificationID(
        messageData.message || '',
        date,
        notificationType,
        completionMessageLog
      ),
      message: messageData.message || '',
      type: messageData.type || NotificationTypeEnum.INFO,
      timestamp: date,
      read: false,
      notificationType,
      createdAt: new Date(),
      date,
      content: messageData.content || '',
      completionMessageLog,
      sendStatus: "Sent" as SendStatus,
      topics: messageData.topics || [],
      highlights: messageData.highlights || [],
      files: messageData.files || [],
      meta: messageData.meta || ({} as Meta),
      rsvpStatus: messageData.rsvpStatus || "notResponded",
      participants: messageData.participants || {},
      teamMemberId: messageData.teamMemberId || "",
      ...messageData,
    };

    this.notifications.push(newNotification);

    if (this.props.setNotifications) {
      this.props.setNotifications((prev) => [...prev, newNotification]);
    }
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.updatedAt = new Date();
    }
  }

  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId);
    if (this.props.setNotifications) {
      this.props.setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  }

  clearNotifications(): void {
    this.notifications = [];
    if (this.props.setNotifications) {
      this.props.setNotifications([]);
    }
  }

  getUnreadNotifications(): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.notifications.filter((notification) => !notification.read);
  }

  updateNotification(
    notificationId: string,
    updates: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    const idx = this.notifications.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      this.notifications[idx] = {
        ...this.notifications[idx],
        ...updates,
        updatedAt: new Date(),
      };

      if (this.props.setNotifications) {
        this.props.setNotifications([...this.notifications]);
      }
    }
  }

  // =====================================================
  // 🔹 Collaboration / Confirmation Handlers
  // =====================================================

  handleConfirm(message: string, randomBytes: any): void {
    this.props.onConfirm(message, randomBytes);
  }

  handleCancel(message: string, randomBytes: any): void {
    this.props.onCancel(message, randomBytes);
  }
}


export default NotificationManager;
export type { NotificationManagerProps, NotificationMessages };
