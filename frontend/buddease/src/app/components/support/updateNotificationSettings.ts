// Import Axios and any other dependencies you need
import axios from 'axios';

// Base API URL
const API_BASE_URL = 'https://your-api-base-url';

// Function to update notification settings
export const updateNotificationSettings = async (notificationSettings: any) => {
  try {
    const token = 'your-jwt-token'; // Replace with your actual JWT token retrieval logic
    const response = await axios.put(
      `${API_BASE_URL}/api/notifications/update-settings`,
      { notification_settings: notificationSettings },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle the response as needed
    console.log(response.data);
    return response.data;
  } catch (error) {
    // Handle errors
    console.error('Error updating notification settings:', error);
    throw error;
  }
};
