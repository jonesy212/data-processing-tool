// Import UIActions into your component
import { endpoints } from '@/app/api/ApiEndpoints';
import generateCustomHeaders from '@/app/api/headers/customHeaders';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { UIActions } from '../../actions/UIActions';
import axiosInstance from '../../security/csrfToken';


const API_BASE_URL = endpoints.notification;
const useNotificationBar = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<
      { message: string; type: string; onCancel?: () => void }[]
  >([]);

  const addNotification = async (
    message: string,
    type: "info" | "success" | "error" | "warning" = "info",
    onCancel?: () => void
  ) => {
    const newNotification = { message, type, onCancel };
    setNotifications([...notifications, newNotification]);

    // Call generateCustomHeaders function to get custom headers
    const headers = generateCustomHeaders({ apiKey: 'your-api-key', token: 'your-token' });

    try {
      const data = {
        message: newNotification.message,
        type: newNotification.type
      };
      const response =  await axiosInstance.post(`${API_BASE_URL}`, data,  headers );
      // Handle response
      return response.data
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }

    // Dispatch the setNotification action
    dispatch(UIActions.setNotification({ message, type }));
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
