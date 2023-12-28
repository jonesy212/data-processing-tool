import { useState } from 'react';

const useNotificationBar = () => {
  const [notifications, setNotifications] = useState<
      { message: string; type: string; onCancel?: () => void }[]
  >([]);

  const addNotification = (message: string, type = "info",  onCancel?: () => void) => {
    const newNotification = { message, type, onCancel };
    setNotifications([...notifications, newNotification]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
};

export default useNotificationBar;
