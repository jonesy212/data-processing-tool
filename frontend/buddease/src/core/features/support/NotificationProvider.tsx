// NotificationProvider.tsx
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { MediaMetadata } from "@/core/config/MetaDataOptions";
import type { ProjectMetadata } from "@/core/config/StructuredMetadata";
import type { TaskMetadata } from "@/core/config/MetaDataOptions";
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { MeetingMetadata } from '@/core/calendar/ScheduledData';
import type { VideoMetadata } from '@/core/config/StructuredMetadata';
import { CustomMediaSession } from '@/core/client/ClientInformation';
import { useMeta } from '@/core/config/useMeta';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { AuthNotificationTypes } from '@/core/features/support/NotificationTypes';
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { Message } from '@/core/generators/GenerateChatInterfaces';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import { logData } from '@/core/services/NotificationService';
import type { NotificationContextProps } from '@/core/state/context/NotificationContext';
import { notificationStoreInstance } from '@/core/state/stores/NotificationStore';
import type {
    NotificationAttachment,
    NotificationEntity,
    NotificationExcludedFields, NotificationIncludedFields,
    NotificationK, NotificationMeta
} from '@/core/typings/entities/NotificationEntity';
import React, { createContext, useState } from 'react';

import { title } from 'process';

export const notificationStore = notificationStoreInstance
export const notificationData: NotificationData<NotificationEntity, NotificationK, NotificationMeta, NotificationAttachment, NotificationExcludedFields, NotificationIncludedFields>[] = [];

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const generateNotificationMessage = (type: string, userName?: string | number): string => {
  switch (type) {
    case 'Welcome':
      return `Welcome, ${userName}!`;
    case 'Error':
      return `Error: ${userName}`;
    case 'Custom':
      return `Custom message: ${userName}`;
    default:
      return 'Unknown Notification Type';
  }
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = <
  T extends BaseDataEntity = NotificationEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = NotificationMeta,
  AttachmentType extends Attachment = NotificationAttachment,
  ExcludedFields extends keyof T = NotificationExcludedFields,
  IncludedFields extends keyof T = NotificationIncludedFields
>({
  children
}: { children: React.ReactNode }) => {
  const area = 'notificationProvider'
  const [notifications, setNotifications] = useState <NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
  const [duration, setDuration] = useState<number>(3000);  // Default duration

  const currentMeta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMeta<T, K>(area)?? {
    metadataEntries: {}, // Provide default or fallback values
    keywords: [],
    version: '1.0.0',
    isActive: false,
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    customFields: {},

    // Add other required properties here
  };

  // Define a metadata object
  const currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    author: "John Doe",
    timestamp: new Date(),
    revisionNotes: "Initial draft",
    area: "dashboard",
    currentMeta: {
      // Core metadata properties
    },
    tags: ["important", "urgent"],
    childIds: [],
    relatedData: [],
    projectId: 123,
    overrides: {},
    relatedKeys: [],
    metadataEntries: {} as Record<string, MetadataEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    videoMetadata: {} as VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    mediaMetadata: {} as MediaMetadata,
    projectMetadata: {} as ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    taskMetadata: {} as TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    meetingMetadata: {} as MeetingMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    customMediaSession: {} as CustomMediaSession<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    phaseMetadata: {},
    structuredMetadata: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  };

  const sendNotification = (
    type: string,
    userName: string | number | undefined
  ) => {
    const message = generateNotificationMessage(type, userName);
    notificationStore.addNotification({
      id: Date.now().toString(),
      content: message,
      date: new Date(),
      notificationType: NotificationTypeEnum.OPERATION_SUCCESS,
      message: "",
      type: AuthNotificationTypes.ACCOUNT_CREATED,
      sendStatus: "Sent",
      completionMessageLog: {
        date: new Date(),
        message: `Notification of type ${NotificationTypeEnum.OPERATION_SUCCESS} sent`,
        createdAt: new Date(),
        content: message,
        timestamp: new Date(),
        level: "info",
      },
      topics: [],
      highlights: [],
      files: [],
      rsvpStatus: "yes",
      host: true, 
      participants: [],
      teamMemberId: "",
      title: "", 
      meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      childIds: [],
      relatedData: [], 
      currentMetadata: {
        area: "notificationProvider", 
        currentMeta: currentMeta, 
        metadataEntries: {},
      },
      major: 1, 
      minor: 0, 
      patch: 0, 
      currentMeta: currentMeta,
    });
  };

  const addNotification = (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    notificationStore.addNotification(notification);
  };

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
        addNotification: (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          notificationStore.addNotification(notification);
          },
        notify: (
          id: string,
          message: string,
          content: string,
          date: Date = new Date(),
          type: NotificationType
        ): Promise<void> => {
          notificationStore.addNotification({
            id,
            content,
            date,
            notificationType: type,
            message: "",
            type: AuthNotificationTypes.ACCOUNT_CREATED,
            sendStatus: "Sent",
            completionMessageLog: logData,
            topics: [],
            highlights: [],
            files: [],
            rsvpStatus: 'yes',
            host: undefined,
            participants: [],
            teamMemberId: '',
            title, meta: 0,
            major: 0,
            minor: 0,
           
            patch: "",
            currentMeta,
            currentMetadata,
            
          });
          console.log(`Notification: ${message}`);
          return Promise.resolve();
        },

        notifications: notificationData,
        showMessage: (message: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
        setNotifications: (notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
          setNotifications(notifications);
        },
        showMessageWithType: (message: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: NotificationType) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
        showSuccessNotification: (message: string) => {
          sendNotification("Success", message);
        },
        showErrorNotification: (message: string) => {
          sendNotification("Error", message);
        },
        setDuration: (duration: number) => {
          setDuration(duration);
        },
        showInfoNotification: (message: string) => { 
          sendNotification("Info", message);
        },
        showNotification: (message: string) => {
          sendNotification("Custom", message);
        }
      }}

    >
      {children}
    </NotificationContext.Provider>
  );
};

