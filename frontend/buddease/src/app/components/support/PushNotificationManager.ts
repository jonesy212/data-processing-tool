import { useNotification } from "./NotificationContext";

class PushNotificationManager {
  static sendPushNotification(message: string, sender: string): void {
    const { notify } = useNotification();
    // Use the notification context to send push notifications
    notify(message, sender, new Date(), "PushNotification");
  }
}

export default PushNotificationManager;
