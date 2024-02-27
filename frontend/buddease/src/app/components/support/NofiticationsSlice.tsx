// NotificationSlice.tsx
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import LogData from '../models/LogData';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { NotificationType, NotificationTypeEnum } from './NotificationContext';

interface NotificationData extends Partial<Data> {
  message: string;
  createdAt: Date;
  content: string;
  type: NotificationType;
  updatedAt?: Date;
  completionMessageLog: LogData;
}

interface NotificationsState {
  notifications: NotificationData[];
}

const initialState: NotificationsState = {
  notifications: [],
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
        createdAt: new Date(),
        content: successMessage,
        completionMessageLog: {} as WritableDraft<LogData>,
        type: NotificationTypeEnum.Info,
        message: successMessage,
      })
    );
  } catch (error) {
    // Dispatch error notification
    dispatch(
      addNotification({
        createdAt: new Date(),
        content: errorMessage + ". Payload received: " + JSON.stringify(payload),
        completionMessageLog: {} as WritableDraft<LogData>,
        type: NotificationTypeEnum.Error,
        message: errorMessage + ": " + error,
      })
    );
  }
};



const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<WritableDraft<NotificationData>>) => {
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
export type { NotificationData };
