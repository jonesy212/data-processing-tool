// NotificationDisplayUI.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import Notification from '../notifications/Notification';
import { useThemeConfig } from '../hooks/userInterface/ThemeConfigContext';
import { selectNotifications } from '../support/NofiticationsSlice';
import { NotificationType } from '@/app/context/NotificationContext';
import NotificationComponent from '../notifications/NotificationComponent';
import { NotificationProps } from '../typings/PropTypes';

const NotificationDisplay: React.FC = () => {
  // Get notifications from Redux state
  const notifications = useSelector(selectNotifications) as NotificationProps[];
  // Get theme configuration from the context
  const { fontSize, fontColor, backgroundColor, themeConfig } = useThemeConfig();

  return (
    <div className="notification-container">
      {/* Render each notification */}
      {notifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          id={notification.id}
          message={notification.message}
          backgroundColor={notification.backgroundColor}
          fontColor={fontColor}
          fontSize={fontSize}
          notifications={notifications}
          type={notification.type}
          themeConfig={themeConfig}
        />
      ))}
    </div>
  );
};

export default NotificationDisplay;
