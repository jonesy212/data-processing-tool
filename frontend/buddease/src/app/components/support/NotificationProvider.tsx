import { K, Meta, T } from "@/app/components/models/data/dataStoreMethods";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { useMeta } from '@/app/configs/useMeta';
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from '@/app/context/NotificationContext';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { title } from 'process';
import React, { createContext, useState } from 'react';
import { BaseData } from '../models/data/Data';
import { logData } from '../notifications/NotificationService';
import { notificationStoreInstance } from '../state/stores/NotificationStore';
import { NotificationData } from './NofiticationsSlice';

export const notificationStore = notificationStoreInstance
export const notificationData: NotificationData<T, K, Meta<T, K>>[] = [];

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
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T
>({
  children
}: { children: React.ReactNode }) => {
  const area = 'notificationProvider'
  const [notifications, setNotifications] = useState <NotificationData<T, K, Meta<T,K>>[]>([]);
  const [duration, setDuration] = useState<number>(3000);  // Default duration

  const currentMeta: StructuredMetadata<T, K> = useMeta<T, K>(area)?? {
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
  const currentMetadata: UnifiedMetadata<MyBaseData, MyExtendedData, MyMeta> = {
    author: "John Doe",
    timestamp: new Date(),
    revisionNotes: "Initial draft",
    area: "dashboard",
    currentMeta: {
      // Core metadata properties
      metadataEntries: [],
      // Other required properties from Meta
    },
    tags: ["important", "urgent"],
    childIds: [],
    relatedData: [],
    projectId: 123,
    overrides: {},
    relatedKeys: [],
    metadataEntries: [],
    videoMetadata: {},
    mediaMetadata: {},
    projectMetadata: {},
    taskMetadata: {},
    meetingMetadata: {},
    customMediaSession: {},
    phaseMetadata: {},
    structuredMetadata: {},
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
      notificationType: NotificationTypeEnum.OperationSuccess,
      message: "",
      type: NotificationTypeEnum.AccountCreated,
      sendStatus: "Sent",
      completionMessageLog: {
        date: new Date(),
        message: `Notification of type ${NotificationTypeEnum.OperationSuccess} sent`,
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
      meta: {} as BaseData<any, any, StructuredMetadata<any, any>>, 
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

  const addNotification = (notification: NotificationData<T, K, Meta<T, K>>) => {
    notificationStore.addNotification(notification);
  };

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
        addNotification: (notification: NotificationData<T, K, Meta<T, K>>) => {
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
            type: NotificationTypeEnum.AccountCreated,
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
        showMessage: (message: Message) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
        setNotifications: (notifications: NotificationData<T, K, Meta<T, K>>[]) => {
          setNotifications(notifications);
        },
        showMessageWithType: (message: Message, type: NotificationType) => {
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

