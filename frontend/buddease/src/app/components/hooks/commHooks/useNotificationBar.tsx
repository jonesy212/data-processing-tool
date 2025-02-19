// Import the FetchUserDataPayload interface and UIActions
import { endpoints } from '@/app/api/ApiEndpoints';
import generateCustomHeaders from '@/app/api/headers/customHeaders';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FetchUserDataPayload, UIActions } from '../../actions/UIActions'; // Import FetchUserDataPayload
import axiosInstance from '../../security/csrfToken';

const API_BASE_URL = endpoints.notification;

const useNotificationBar = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<FetchUserDataPayload[]>([]);

  // Update the addNotification function signature to use FetchUserDataPayload
  const addNotification = async ({
    message,
    userData,
    notificationType,
    notificationMessage,
    type = "info",
    onCancel
  }: FetchUserDataPayload) => {
    const newNotification = { message, type, onCancel };
    setNotifications([...notifications, newNotification]);

    const headers = generateCustomHeaders({ apiKey: 'your-api-key', token: 'your-token' });

    try {
      const data = {
        message: newNotification.message,
        type: newNotification.type
      };
      const response = await axiosInstance.post(`${API_BASE_URL}`, data, headers);
      // Handle response
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }

    // Dispatch the addUINotification action
    await dispatch(UIActions.addUINotification({
      type,
      message,
      isDarkMode: false
    }));
  };

  const clearNotifications = () => {
    setNotifications([]);

    // Dispatch the clearNotification action
    dispatch(UIActions.clearNotification());
  };

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
};

export default useNotificationBar;
