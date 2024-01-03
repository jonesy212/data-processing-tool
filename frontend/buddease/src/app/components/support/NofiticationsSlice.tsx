import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  content: string;
  date: Date;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      // Assuming each notification has a unique id
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Add other notification-related actions as needed
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;
export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications;

export default notificationsSlice.reducer;
