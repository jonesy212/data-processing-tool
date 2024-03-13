// NotificationSlice.tsx
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import { LogData } from '../models/LogData';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { NotificationType, NotificationTypeEnum } from './NotificationContext';


export type SendStatus = "Sent" | "Delivered" | "Read" | "Error";

interface NotificationData extends Partial<Data>, Partial<CalendarEvent> {
  id: string;
  message: string;
  createdAt: Date;
  content: string;
  type: NotificationType;
  updatedAt?: Date;
  status: "scheduled" | "tentative" | "inProgress" | "confirmed" | "cancelled" | "completed" | "pending" | undefined;
  completionMessageLog: LogData;
  notificationType?: NotificationTypeEnum;
  sendStatus: SendStatus; // Add sendStatus property

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
        id: actionType,
        createdAt: new Date(),
        content: successMessage,
        completionMessageLog: {} as WritableDraft<LogData>,
        type: NotificationTypeEnum.Info,
        message: successMessage,
        status: "tentative",
        sendStatus: "Sent"
      })
    );
  } catch (error) {
    // Dispatch error notification
    dispatch(
      addNotification({
        id: actionType,
        createdAt: new Date(),
        content: errorMessage + ". Payload received: " + JSON.stringify(payload),
        completionMessageLog: {} as WritableDraft<LogData>,
        type: NotificationTypeEnum.Error,
        message: errorMessage + ": " + error,
        status: "tentative",
        sendStatus: "Error"
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
