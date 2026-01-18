// NotificationComponent.tsx
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationType, NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { ThemeConfigProps } from "@/core/hooks/userInterface/ThemeConfigContext";
import useNotificationManagerService from "@/core/services/NotificationService";
import { randomBytes } from "ethers";
import React from "react";

if (typeof window !== 'undefined') {
  import('@/core/components/notifications/NotificationComponent');
}

interface CustomNotificationProps {
  type: NotificationType;
  message: string;
  
}

const CustomNotification: React.FC<CustomNotificationProps> = ({ type, message }) => {
  let notificationStyle = "";

  switch (type) {
    case NotificationTypeEnum.INFO:
      notificationStyle = 'info-notification';
    case NotificationTypeEnum.SUCCESS:
      notificationStyle = "success-notification";
      break;
    case NotificationTypeEnum.ERROR:
      notificationStyle = "error-notification";
      break;
    case NotificationTypeEnum.Warning:
      notificationStyle = "warning-notification";
      break;
    default:
      break;
  }

  return (
    <div className={`notification ${notificationStyle}`}>
      {message}
    </div>
  );
};

interface NotificationComponentProps  {
  notifications: NotificationData[];
  id: NotificationData['id']
  fontColor: string;
  fontSize: string;
  
}

const NotificationComponent: React.FC<NotificationComponentProps & CustomNotificationProps & ThemeConfigProps> = ({ notifications }) => {
  const useNotificationManager = useNotificationManagerService();

  const handleDismiss = async (notification: NotificationData): Promise<void> => {
    const { notify } = useNotificationManager;
    const randomBytesValue = randomBytes(8);
    const randomBytesString = Buffer.from(randomBytesValue).toString("hex");

    await notify(
      "messageDismissed" + randomBytesString, // Unique id for dismissal
      "message was dismissed due to a random event", // Message for dismissal
      NOTIFICATION_MESSAGES.Message.MESSAGE_DISMISSED_DUE_TO_RANDOM_EVENT, // Standardized message
      new Date(),
      "Dismiss" as NotificationType // Adjusted type for random dismissals
    );
  };

  const handleButtonClick = async (): Promise<void> => {
    useNotificationManager.sendPushNotification("New message!", "App");
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id}>
          <CustomNotification 
            type={notification.type ?? NotificationTypeEnum.INFO} // Provide a default type if undefined
            message={notification.message} 
          />
          <button onClick={() => handleDismiss(notification)}>
            Dismiss
          </button>
        </div>
      ))}
      <button onClick={handleButtonClick}>
        Send Push Notification
      </button>
    </div>
  );
};

export default NotificationComponent;
