// NotificationManager.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Notification, selectNotifications } from "./NofiticationsSlice";
import { NotificationType, useNotification } from "./NotificationContext";

interface NotificationContextValue {
  notifications: Notification[];
  notify: (
    message: string,
    content: any,
    date: Date | undefined,
    type: NotificationType
  ) => Promise<void>;  
}

const NotificationManager: React.FC<NotificationContextValue> = () => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);

  return (
    <div>
      {notifications.map((notification) => (
        <div key={notification.id}>
          {notification.message}
          <button
            onClick={() =>
              notify(
                "Message dismissed",
                "content", 
                new Date(),
                "Dismiss" as NotificationType
              )
            }
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;
export type { NotificationContextValue };
