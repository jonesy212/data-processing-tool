// NotificationDisplayUI.tsx
// Import necessary dependencies
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification, selectNotifications } from './NotificationSlice';
import Notification from './Notification';

// Create a component to display notifications
const NotificationDisplay = () => {
  // Get notifications from Redux state
  const notifications = useSelector(selectNotifications);

  return (
    <div className="notification-container">
      {/* Render each notification */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          backgroundColor={notification.backgroundColor}
          textColor={notification.textColor}
          fontSize={notification.fontSize}
        />
      ))}
    </div>
  );
};