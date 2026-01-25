// NofiticationsSlice.tsx
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { DocumentOptions } from '@/core/documents/DocumentOptions';
import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import { createSlice } from '@reduxjs/toolkit';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { WritableDraft } from '@/core/state/redux/ReducerGenerator';

import type { 
    NotificationEntity,
    NotificationK,
    NotificationMeta,
    NotificationAttachment,
    NotificationExcludedFields,
    NotificationIncludedFields,
    NotificationSnapshotData,
    NotificationSnapshotStore,
    NotificationSnapshotWithCriteria,
    NotificationUnifiedMetadata
} from '@/core/typings/entities/NotificationEntity';
import type { Dispatch, PayloadAction } from "@reduxjs/toolkit";


export type SendStatus = "Sent" | "Delivered" | "Read" | "Error";

export type TeamStatus = "active" | "inactive" | "onHold"; // Define TeamStatus enum

export type DataStatus = "processing" | "completed" | "failed"; // Define DataStatus enum

interface NotificationsState<
  T extends BaseDataEntity = NotificationEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = NotificationMeta,
  AttachmentType extends Attachment = NotificationAttachment,
  ExcludedFields extends keyof T = NotificationExcludedFields,
  IncludedFields extends keyof T = NotificationIncludedFields
> {
  notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}


const initialState: NotificationsState<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
> = {
  notifications: [{} as NotificationSnapshotData] 
};


// Helper function to dispatch notifications
export const dispatchNotification = (
  actionType: string,
  successMessage: string,
  errorMessage: string,
  dispatch: Dispatch<any>,
  payload?: any
) => {
  try {
    // Dispatch success notification
    dispatch(
      addNotification({
        id: actionType,
        date: new Date(),
        content: successMessage,
        completionMessageLog: {} as WritableDraft<NotificationSnapshotData>, // Use your alias
        type: NotificationTypeEnum.INFO,
        message: successMessage,
        status: "tentative",
        sendStatus: "Sent",
        email: "test@email.com",
        notificationType: NotificationTypeEnum.INFO,
        inApp: true,
        options: {
          additionalOptions: undefined,
          additionalDocumentOptions: {} as WritableDraft<DocumentOptions>,
          additionalOptionsLabel: ''
        },
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: 'yes',
        participants: [],
        teamMemberId: '',
        meta: undefined,
        getSnapshotStoreData: function (): Promise<NotificationSnapshotStore[]> { // Use your alias
          throw new Error('Function not implemented.');
        }
      })
    );
  } catch (error) {
    // Dispatch error notification
    dispatch(
      addNotification({
        id: actionType,
        createdAt: new Date(),
        content: errorMessage + ". Payload received: " + JSON.stringify(payload),
        completionMessageLog: {} as WritableDraft<NotificationSnapshotData>, // Use your alias
        type: NotificationTypeEnum.ERROR,
        message: errorMessage + ": " + error,
        status: "tentative",
        sendStatus: "Error",
        email: "test@email.com",
        notificationType: NotificationTypeEnum.ERROR,
        inApp: true,
        options: {
          additionalOptions: undefined,
          additionalDocumentOptions: {} as WritableDraft<DocumentOptions>,
          additionalOptionsLabel: ''
        },
        data: payload,
        date: new Date(),
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: 'yes',
        participants: [],
        teamMemberId: '',
        meta: {} as WritableDraft<NotificationUnifiedMetadata>, // Use your alias
        getSnapshotStoreData: function (): Promise<SnapshotStore<
          NotificationSnapshotWithCriteria, // Use your alias
          NotificationSnapshotWithCriteria, // Use your alias
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >[]> {
          throw new Error('Function not implemented.');
        }
      })
    );
  }
};


const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<WritableDraft<NotificationData<T, K, Meta>>>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },  
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;
export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications;

export default notificationsSlice.reducer;




