// notification/NotificationActions.ts
import { createAction } from "@reduxjs/toolkit";
import { NotificationData } from "./NofiticationsSlice";

export const NotificationActions = {
  // Single notification actions
  addNotification: createAction<NotificationData>("addNotification"),
  removeNotification: createAction<string>("removeNotification"),
  clearNotifications: createAction("clearNotifications"),

  // Request, success, and failure actions
  fetchNotifications: createAction<NotificationData[]>("fetchNotifications"),
  fetchNotificationsRequest: createAction("fetchNotificationsRequest"),
  fetchNotificationsSuccess: createAction<NotificationData[]>("fetchNotificationsSuccess"),
  fetchNotificationsFailure: createAction<string>("fetchNotificationsFailure"),

  // Batch actions
  batchAddNotifications: createAction<NotificationData[]>("batchAddNotifications"),
  batchRemoveNotifications: createAction<string[]>("batchRemoveNotifications"),
  // Add more batch actions as needed
};
