import React from 'react';
import { useNotification } from './NotificationContext';

interface NotificationManagerProps {}

interface Notification {
  id: string;
  message: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type: string) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = () => {
  const { notifications } = useNotification() ;

  return (
    <div>
      {notifications.map((notification: Notification) => (
        <div key={notification.id}>{notification.message}</div>
      ))}
    </div>
  );
};


export default NotificationManager;
