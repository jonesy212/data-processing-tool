// NotificationActions.ts
// notification/NotificationActions.ts

import type { AppNotificationData } from '@/core/typings/entities/CommonEntities';
import { createAction } from "@reduxjs/toolkit";

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