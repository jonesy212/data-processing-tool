// useNotificationManagerSlice.ts
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

export interface NotificationState {
  notifications: NotificationData[];
  loading: boolean;
  error: string | null;
  
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};


const initialNotificationState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
}




export const useNotificationManagerSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    fetchNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },

    fetchNotificationsSuccess(state, action: PayloadAction<WritableDraft<NotificationData>[]>) {
      state.loading = false;
      state.notifications = action.payload;
    },

    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    addNotification(state, action: PayloadAction<WritableDraft<NotificationData>>) {
      state.notifications.push(action.payload);
    },

    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  removeNotification,
  clearNotifications,
} = useNotificationManagerSlice.actions;

// Export reducer
export default useNotificationManagerSlice.reducer;

// Selectors
export const selectNotifications = (state: RootState) =>
  state.notificationManager.notifications;
export const selectNotificationLoading = (state: RootState) =>
  state.notificationManager.loading;
export const selectNotificationError = (state: RootState) =>
  state.notificationManager.error;


export const useNotificationSlice = () => {
  const dispatch = useDispatch();

  return {
    fetchNotifications: () => dispatch(fetchNotificationsStart()),
    addNotification: (notification: WritableDraft<NotificationData>) => dispatch(addNotification(notification)),
    removeNotification: (id: any) => dispatch(removeNotification(id)),
    clearNotifications: () => dispatch(clearNotifications()),
  };
};

export { initialNotificationState };
