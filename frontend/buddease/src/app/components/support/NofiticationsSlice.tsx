// notificationsSlice.ts
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
    // Add other notification-related actions as needed
  },
});

export const { addNotification } = notificationsSlice.actions;
export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications;

export default notificationsSlice.reducer;
