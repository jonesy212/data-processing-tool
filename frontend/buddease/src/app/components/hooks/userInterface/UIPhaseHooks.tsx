import axios from 'axios';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import NotificationMessagesFactory from '../../support/NotificationMessagesFactory';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';
import useNotificationBar from '../commHooks/useNotificationBar';
import { createPhaseHook } from '../phaseHooks/PhaseHooks';
import useDarkModeToggle from './useDarkModeToggle';




export const darkModeTogglePhaseHook = createPhaseHook({
  condition: () => {
    // Add your condition logic for when dark mode toggle should be active
    return true;
  },
  asyncEffect: async () => {
    const { toggleDarkMode, isDarkMode } = useDarkModeToggle();

    // Add any async logic for the dark mode toggle phase
    console.log('Dark Mode Toggle Phase Hook triggered');

    // Example: Make an Axios request
    try {
      const response = await axios.get('/api/dark-mode-settings'); // Adjust the API endpoint

      // Handle the response data as needed
      console.log('Dark mode settings:', response.data);
    } catch (error: any) {
      // Handle errors
      console.error('Error fetching dark mode settings:', NOTIFICATION_MESSAGES.Error.UI_THEME);
    }

    // Toggle dark mode based on a condition
    if (!isDarkMode) {
      toggleDarkMode();
    }

    // Simulate an asynchronous action (e.g., updating user settings)
    const updateSettings = async () => {
      // Your asynchronous logic here
    };

    await updateSettings();

    return () => {
      // Cleanup logic for dark mode toggle phase
      console.log('Cleanup for Dark Mode Toggle Phase');
    };
  },
  name: ''
});




export const notificationBarPhaseHook = createPhaseHook({
  condition: () => {
    // Add your condition logic for when the notification bar should be active
    // For example, check if the user is logged in
    return isLoggedIn();
  },
  asyncEffect: async () => {
    const { addNotification, clearNotifications } = useNotificationBar();

    // Add any async logic for the notification bar phase
    console.log("Notification Bar Phase Hook triggered");

    try {
      // Simulate fetching notifications from an API
      const response = await axios.get("/api/notifications"); // Adjust the API endpoint

      // Handle the response data
      const notifications = response.data as Notification[];

      if (notifications.length > 0) {
        // Display each notification
        notifications.forEach((notification: Notification) => {
          addNotification(notification.data.message);
        });
      } else {
        // Display a generic message if no notifications are available
        addNotification(NOTIFICATION_MESSAGES.NO_NOTIFICATIONS.DEFAULT, "info");
      }
    } catch (error: any) {
      // Handle errors
      console.error("Error fetching notifications:", NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
      addNotification(
        NotificationMessagesFactory.createErrorMessage(
          "Failed to fetch notifications"
        ),
        "error" as NOTIFICATION_TYPES
      );
    }

    // Simulate an asynchronous action (e.g., fetching additional data)
    const fetchData = async () => {
      // Your asynchronous logic here

      // For example, fetch user data
      const userData = await axios.get("/api/user"); // Adjust the API endpoint

      // Display a success notification with user data
      addNotification(
        NotificationMessagesFactory.createCustomMessage("User data fetched"),
        "success"
      );
      return {
        userData: userData,
      };
    };

    await fetchData();

    return clearNotifications; // Cleanup function
  },
  name: "Notification Bar Phase", // Add a meaningful name for the phase
});

// Helper function to simulate user login status
const isLoggedIn = () => {
  // Your logic to check if the user is logged in
  return true; // For demonstration purposes, always return true
};
