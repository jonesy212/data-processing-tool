import { useState } from 'react';

const useWebNotifications = () => {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const showNotification = (title: any, options: any) => {
    if (notificationPermission === "granted") {
      new Notification(title, options);
    } else {
      console.warn("Notification permission not granted.");
    }
  };

  return {
    notificationPermission,
    requestNotificationPermission,
    showNotification,
  };
};

export default useWebNotifications;
