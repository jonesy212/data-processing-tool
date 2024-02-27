// NotificationComponent.tsx
import { NotificationType } from '@/app/components/support/NotificationContext';
import React from 'react';
import { NotificationData } from './NofiticationsSlice';
import './NotificationComponent.css'; // Assuming styles are defined here
import { NotificationTypeEnum, useNotification } from './NotificationContext';

const CustomNotification: React.FC<{ type: NotificationType, message: string }> = ({ type, message }) => {
  let notificationStyle = '';

  switch (type) {
    case  NotificationTypeEnum.Success:
      notificationStyle = 'success-notification';
      break;
    case NotificationTypeEnum.Error:
      notificationStyle = 'error-notification';
      break;
    case NotificationTypeEnum.Warning:
      notificationStyle = 'warning-notification';
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

const NotificationComponent: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification: NotificationData, index: number) => (
        <CustomNotification key={index} type={notification.type} message={notification.message} />
      ))}
    </div>
  );
};

export default NotificationComponent;
