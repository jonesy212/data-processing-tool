import { randomBytes } from "ethers"; // Import randomBytes from ethers
import React from "react";
import { NotificationType } from "../support/NotificationContext";
import useNotificationManagerService from "./NotificationService";
import { NotificationData } from "../support/NofiticationsSlice";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";

interface NotificationComponentProps {
  notifications: NotificationData[];
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ notifications }) => {
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
    <div>
      {notifications.map((notification) => (
        <div key={notification.id}>
          {notification.message}
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
