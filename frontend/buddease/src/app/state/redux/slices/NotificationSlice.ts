// useNotificationManagerSlice.ts
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { WritableDraft } from "@/app/ReducerGenerator";
import { NotificationData } from "@/app/support/NofiticationsSlice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { RootState } from "@/state/redux/slices/RootSlice";


interface NotificationEntity extends BaseDataEntity {
  id: string;
  message: string;
  read?: boolean;
  timestamp?: Date;
  type?: string;
}

type NotificationK = NotificationEntity;
type NotificationMeta = DefaultMeta<NotificationEntity, NotificationK>;
type NotificationExcludedFields = DefaultExcludedFields<NotificationEntity>;
type AppNotification = NotificationData<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  Attachment,
  NotificationExcludedFields
>;

export interface NotificationState {
  notifications: NotificationData<
    NotificationEntity,
    NotificationK,
    NotificationMeta,
    Attachment,
    NotificationExcludedFields
  >[];
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
  initialState: {
    notifications: [] as AppNotification[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    fetchNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },

    fetchNotificationsSuccess(state, action: PayloadAction<WritableDraft<AppNotification>[]>) {
      state.loading = false;
      state.notifications = action.payload;
    },

    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    addNotification(state, action: PayloadAction<WritableDraft<AppNotification>>
) {
      state.notifications.push(action.payload);
    },

    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
       (notification: AppNotification) => notification.id !== action.payload
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
