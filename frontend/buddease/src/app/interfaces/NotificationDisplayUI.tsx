// NotificationDisplayUI.tsx
import { useThemeConfig } from '@/app/hooks/userInterface/ThemeConfigContext';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotifications } from '../features/support/NofiticationsSlice';
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
