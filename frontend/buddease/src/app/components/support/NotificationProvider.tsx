// NotificationProvider.tsx

import NOTIFICATION_MESSAGES from "./NotificationMessages";
import { NOTIFICATION_TYPES } from "./NotificationTypes";


const generateNotificationMessage = (
  type: NOTIFICATION_TYPES,
  userName?: string
): string => {
  const messageType = type.toLowerCase();

  if (messageType) {
    switch (type) {
      case NOTIFICATION_TYPES.WELCOME:
        return messageType + " " + userName + " " + NOTIFICATION_MESSAGES.Welcome.DEFAULT

      case NOTIFICATION_TYPES.ACCOUNT_CREATED:
        return messageType + " " + userName + " " + NOTIFICATION_MESSAGES.Welcome.ACCOUNT_CREATED

      case NOTIFICATION_TYPES.ERROR:
        return messageType + userName + NOTIFICATION_MESSAGES.Error.DEFAULT(userName || "");

      // Add cases for other notification types as needed

      default:
        return "Unknown Notification Type";
    }
  }

  return "Unknown Notification Type";
};

// ...
