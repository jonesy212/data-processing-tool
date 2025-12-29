// PushNotificationManager.ts
import { useNotification } from '@/core/state/context/NotificationContext';

const { notify } = useNotification()

interface SimpleNotificationParams {
  message: string;
  sender: string;
  type?: NotificationType;
  options?: {
    additionalOptions?: any;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
  };
}

class PushNotificationManager {
  static sendPushNotification(params: SimpleNotificationParams): void {
    const { notify } = useNotification();
    const { message, sender, type = "PushNotification", options } = params;
    
    notify(
      null,
      message,
      sender,
      new Date(),
      type,
      type,
      options,
      sender
    );
  }
}

// Usage:
PushNotificationManager.sendPushNotification({
  message: "Hello world",
  sender: "System"
});


export default PushNotificationManager;
