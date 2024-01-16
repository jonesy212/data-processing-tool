import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotifications } from './NofiticationsSlice';
import { useNotification } from './NotificationContext';

interface NotificationManagerProps {
  notifications: Notification[];
}

interface Notification {
  id: string;
  message: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type: string) => void;
}

// ... (previous imports and interfaces)

const NotificationManager: React.FC<NotificationContextValue> = () => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => notify(notification.message, 'delete')}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;
