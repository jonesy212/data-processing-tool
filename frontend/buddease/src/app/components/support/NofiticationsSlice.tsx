// NotificationSlice.tsx
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { Data } from '../models/data/Data';
import { LogData } from '../models/LogData';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { AllStatus } from '../state/stores/DetailsListStore';
import { NotificationTypeEnum } from './NotificationContext';


export type SendStatus = "Sent" | "Delivered" | "Read" | "Error";

export type TeamStatus = "active" | "inactive" | "onHold"; // Define TeamStatus enum

export type DataStatus = "processing" | "completed" | "failed"; // Define DataStatus enum




interface NotificationData extends Data, CalendarEvent {
  id: string;
  message: string;

  createdAt?: Date;
  updatedAt?: Date;
  content: any;
  // type: NotificationType;
  sendStatus?: SendStatus | boolean; // Add sendStatus property
  completionMessageLog: LogData | undefined;
  date?: Date | undefined;
  email?: string;
  status?: AllStatus
  inApp?: boolean; // Add inApp property to differentiate push vs in-app
  notificationType?: NotificationTypeEnum | string
  options?: {
    additionalOptions: readonly string[] | string | number | any[] | undefined
  }
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
        // createdAt: new Date(),
        date: new Date(),
        content: successMessage,
        completionMessageLog: {} as WritableDraft<LogData>,
        type: NotificationTypeEnum.Info,
        message: successMessage,
        status: "tentative",
        sendStatus: "Sent",
        email: "test@email.com",
        notificationType: NotificationTypeEnum.Info,
        inApp: true,
        options: {
          additionalOptions: undefined
        },
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: 'yes',
        participants: [],
        teamMemberId: ''
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
        sendStatus: "Error",
        email: "test@email.com",
        notificationType: NotificationTypeEnum.Error,
        inApp: true,
        options: {
          additionalOptions: undefined
        },
        data: payload,
        date: new Date(),
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: 'yes',
        participants: [],
        teamMemberId: ''
      },
      )
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
