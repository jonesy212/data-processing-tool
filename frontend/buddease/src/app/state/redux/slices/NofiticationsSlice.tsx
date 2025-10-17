// NotificationSlice.tsx
import { NotificationTypeEnum } from '@/app/context/NotificationContext';
import { DocumentOptions } from '@/app/documents/DocumentOptions';
import { BaseData } from '@/app/models/data/Data';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { LogData } from '@/models/LogData';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { StructuredMetadata } from "@/config/StructuredMetadata";
 
export type SendStatus = "Sent" | "Delivered" | "Read" | "Error";

export type TeamStatus = "active" | "inactive" | "onHold"; // Define TeamStatus enum

export type DataStatus = "processing" | "completed" | "failed"; // Define DataStatus enum

interface NotificationsState {
  notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

const initialState: NotificationsState = {
  notifications: [{} as NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>] 
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
        // createdAt: new Date(),
        date: new Date(),
        content: successMessage,
        completionMessageLog: {} as WritableDraft<LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
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
        getSnapshotStoreData: function (): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
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
        completionMessageLog: {} as WritableDraft<LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
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
        meta: {} as WritableDraft<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<Base<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, SnapshotWithCriteria<BaseData>>[]> {
          throw new Error('Function not implemented.');
        }
      },
      )
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
