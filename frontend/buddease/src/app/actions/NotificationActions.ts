// notification/NotificationActions.ts
import { createAction } from "@reduxjs/toolkit";
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import { AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields } from "@/app/snapshots/snapshotStoreConfigInstance";
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from "@/config/BaseConfig";

// Create a type alias for your notification data
type AppNotificationData = NotificationData<
  AppEntity, 
  AppK, 
  AppMeta, 
  AppAttachment, 
  AppExcludedFields, 
  AppIncludedFields
>;

export const NotificationActions = {
  // Single notification actions
  addNotification: createAction<AppNotificationData>("addNotification"),
  removeNotification: createAction<string>("removeNotification"),
  clearNotifications: createAction("clearNotifications"),

  // Request, success, and failure actions
  fetchNotifications: createAction<AppNotificationData[]>("fetchNotifications"),
  fetchNotificationsRequest: createAction("fetchNotificationsRequest"),
  fetchNotificationsSuccess: createAction<AppNotificationData[]>("fetchNotificationsSuccess"),
  fetchNotificationsFailure: createAction<string>("fetchNotificationsFailure"),

  showSuccessNotification: createAction<{ message: string; type?: string }>("showSuccessNotification"),
  showErrorNotification: createAction<{ message: string; type?: string; }>("showErrorNotification"),
  setNotifications: createAction<React.SetStateAction<AppNotificationData[]>>("setNotifications"),
  
  // Batch actions
  batchAddNotifications: createAction<AppNotificationData[]>("batchAddNotifications"),
  batchRemoveNotifications: createAction<string[]>("batchRemoveNotifications"),
};