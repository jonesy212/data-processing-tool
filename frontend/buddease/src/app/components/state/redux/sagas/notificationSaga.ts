// notification/NotificationSaga.ts
import useNotificationManagerService from "@/app/components/notifications/NotificationService";
import { NotificationActions } from "@/app/components/support/NotificationActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker Saga: Add Notification
function* addNotificationSaga(action: any) {
    try {
      const notification = action.payload;
      // Call the notification service method to add the notification
      yield call(useNotificationManagerService().addNotification, notification);
      // Dispatch a success action if needed
    } catch (error) {
      yield put({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: NOTIFICATION_MESSAGES.Notifications.DEFAULT("Error", "Add Notification Error"),
          type: "error",
        },
      });
    }
  }
  
  // Worker Saga: Remove Notification
  function* removeNotificationSaga(action: any) {
    try {
      const notificationId = action.payload;
      // Call the notification service method to remove the notification
      yield call(useNotificationManagerService().removeNotification, notificationId);
      // Dispatch a success action if needed
    } catch (error) {
      yield put({
        type: "SHOW_NOTIFICATION",
        payload: {
            message: NOTIFICATION_MESSAGES.Notifications.DEFAULT("Remove Notification Error", "Error occurred while attempting to remove notification"),
            type: "error",
        },
      });
    }
  }
  
  // Worker Saga: Clear Notifications
  function* clearNotificationsSaga() {
    try {
      // Call the notification service method to clear all notifications
      yield call(useNotificationManagerService().clearNotifications);
      // Dispatch a success action if needed
    } catch (error) {
      yield put({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: NOTIFICATION_MESSAGES.Notifications.DEFAULT("Clear Notifications Error", "Error occurred while attempting to clear notifications"),
          type: "error",
        },
      });
    }
  }
  
  // Watcher Saga: Watches for notification actions
  function* watchNotificationSagas() {
    yield takeLatest(NotificationActions.addNotification.type, addNotificationSaga);
    yield takeLatest(NotificationActions.removeNotification.type, removeNotificationSaga);
    yield takeLatest(NotificationActions.clearNotifications.type, clearNotificationsSaga);
  }
  
  // Export the notification sagas
  export function* notificationSagas() {
    yield watchNotificationSagas();
  }