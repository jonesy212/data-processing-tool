// Notification.ts
import React, { useContext } from 'react';
import { ThemeConfigProps } from '../hooks/userInterface/ThemeConfigContext';
import  useNotificationStore from '../state/stores/NotificationStore';
import { NotificationContext, NotificationTypeEnum } from '../support/NotificationContext';
import { NotificationProps } from '../typings/PropTypes';

interface NotificationStyleProps extends ThemeConfigProps, NotificationProps {}


enum NotificationPreferenceEnum {
  Email = "email",
  PushNotification = "push_notification",
  SMS = "sms",
  InAppNotification = "in_app_notification",
  None = "none",
}

const Notification: React.FC<NotificationStyleProps> = ({
  message,
  backgroundColor,
  primaryColor,
  fontSize,
}) => {
  const notificationStyle = {
    backgroundColor: backgroundColor || "#ffffff", // Default background color
    color: primaryColor || "#000000", // Default text color
    fontSize: fontSize || "16px", // Default font size
  };

  const { addNotification, notify } = useContext(NotificationContext);

  // Function to handle notification dismissal
  const handleDismiss = async (notificationId: string) => {
    // Implement dismissal logic here
    try {
      // Example: Dismiss notification by removing it from the notification store
      useNotificationStore.getState().dismissNotification(notificationId);

      // Notify dismissal
      notify(
        "dismissedNotification for " + notificationId, // Unique id for dismissal
        "Notification dismissed", // Message for dismissal
        "Notification dismissed successfully", // Standardized message
        new Date(),
        NotificationTypeEnum.Info // Notification type for dismissal
      );
    } catch (error) {
      console.error("Error dismissing notification:", error);
      notify(
        "dismissNotificationError", // Unique id for error
        "Error dismissing notification", // Message for error
        "Error occurred while dismissing notification", // Standardized error message
        new Date(),
        NotificationTypeEnum.Error // Notification type for error
      );
    }
  };
  return (
    <div className="notification" style={notificationStyle}>
      <span>{message}</span>
      <button onClick={() => handleDismiss(addNotification.toString())}>Dismiss</button>
    </div>
  );
};

export default Notification;
export { NotificationPreferenceEnum };
