// notification/NotificationActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Notification } from "./NofiticationsSlice";

export const NotificationActions = {
  // Single notification actions
  addNotification: createAction<Notification>("addNotification"),
  removeNotification: createAction<string>("removeNotification"),
  clearNotifications: createAction("clearNotifications"),

  // Request, success, and failure actions
  fetchNotificationsRequest: createAction("fetchNotificationsRequest"),
  fetchNotificationsSuccess: createAction<Notification[]>("fetchNotificationsSuccess"),
  fetchNotificationsFailure: createAction<string>("fetchNotificationsFailure"),

  // Batch actions
  batchAddNotifications: createAction<Notification[]>("batchAddNotifications"),
  batchRemoveNotifications: createAction<string[]>("batchRemoveNotifications"),
  // Add more batch actions as needed
};
