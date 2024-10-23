// UIPhase.tsx
// UIPhase.ts
import { fetchData } from "@/app/api/ApiData";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import UserService, * as userApi from '../../../app/components/users/ApiUser';
import useUIRealtimeData from "../hooks/commHooks/useUIRealtimeData";
import { NotificationData } from "../support/NofiticationsSlice";
import { logData } from "../notifications/NotificationService";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import NotificationMessagesFactory from "../support/NotificationMessagesFactory";
import { updateCallback } from "../state/stores/CalendarEvent";
import { initializeUserData } from "@/app/pages/onboarding/PersonaBuilderData";
import { UIActions } from "../actions/UIActions";
import useNotificationBar from "../hooks/commHooks/useNotificationBar";
import { createPhaseHook } from "../hooks/phaseHooks/PhaseHooks";
import useDarkModeToggle from "../hooks/userInterface/useDarkModeToggle";

const createDarkModeTogglePhaseHook = () => {
  return createPhaseHook(
    idleTimeoutId,
    {
    name: 'Dark Mode Toggle Phase',
    condition: async () => true,
    duration: '10000',
    asyncEffect: async () => {
      const { toggleDarkMode, isDarkMode } = useDarkModeToggle();
      console.log('Dark Mode Toggle Phase Hook triggered');
      await fetchData('dark-mode-settings');
      if (!isDarkMode) {
        toggleDarkMode();
      }
      await UIActions.fetchUserDataAndDisplayNotification({
        message: 'Your message here', // Provide the appropriate message
        // Add other properties if needed
      });
      return () => console.log('Cleanup for Dark Mode Toggle Phase');
    },
    phaseType: 'UI',
  });
}

export const darkModeTogglePhaseHook = createDarkModeTogglePhaseHook();

const createNotificationBarPhaseHook = () => {
  return createPhaseHook({
    condition: isLoggedIn,
    duration: '10000',
    asyncEffect: async () => {
      const { addNotification, clearNotifications } = useNotificationBar();
      console.log('Notification Bar Phase Hook triggered');
      await fetchAndDisplayNotifications(addNotification, clearNotifications);
      return clearNotifications;
    },
    name: 'Notification Bar Phase',
    isActive: false,
  });
};

const isLoggedIn = () => true;

export const notificationBarPhaseHook = createNotificationBarPhaseHook();

// Custom hook to fetch and display notifications
const fetchAndDisplayNotifications = async (addNotification: Function, clearNotifications: Function) => {
  try {
    const notifications = await fetchData('notifications');
    if (notifications.length > 0) {
      notifications.forEach((notification: NotificationData) => {
        displayNotification(notification, addNotification);
      });
    } else {
      displayNotification({
        data: { message: '' },
        id: '',
        message: '',
        content: '',
        type: NotificationTypeEnum.AccountCreated,
        sendStatus: 'Error',
        completionMessageLog: logData,
        date: new Date(),
        notificationType: ''
      }, addNotification);
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    addNotification(NotificationMessagesFactory.createErrorMessage('Failed to fetch notifications'), 'UIError' as NotificationType);
  }
};

const displayNotification = (notification: NotificationData, addNotification: Function) => {
  const message = notification.data?.message;
  const type = message ? 'info' : 'error';
const defaultMessage = message || NOTIFICATION_MESSAGES.UI.NO_NOTIFICATIONS_DEFAULT;
  addNotification(defaultMessage, type);
};

const fetchUserDataAndDisplayNotification = async (
  addNotification: Function,
  req: any, // Assuming req and res are provided by the caller
  res: any
) => {
  try {
    const userService = new UserService(); // Create an instance of UserService
    const userData = await userService.fetchUserData(req, res);
    addNotification(NotificationMessagesFactory.createCustomMessage('User data fetched'), 'success');
    return userData;
  } catch (error: any) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};


export const useUIReatimeData = () => {
  const dispatch = useDispatch();
     // Subscribe to the messaging system or WebSocket events
     const socket = new WebSocket('wss://example.com'); //#todo// Replace with your WebSocket endpoint

  useEffect(() => {
    // Call the useUIRealtimeData hook with initial data and update callback
    const { realtimeData, fetchData } = useUIRealtimeData(
      initializeUserData,
      updateCallback
    );

    // Example: Dispatch an action with the fetched realtime data
    dispatch(UIActions.setRealtimeData(realtimeData));

    // Cleanup function
    return () => {
      if (socket && socket.removeEventListener) {
        socket.removeEventListener("updateData", () => {});
      }
    };
  }, [dispatch]);
};
