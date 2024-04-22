import { endpoints } from '@/app/api/ApiEndpoints';
import axios from 'axios';
import { LogData } from '../../models/LogData';
import { NotificationData } from '../../support/NofiticationsSlice';
import { NotificationTypeEnum } from '../../support/NotificationContext';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import NotificationMessagesFactory from '../../support/NotificationMessagesFactory';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';
import useNotificationBar from '../commHooks/useNotificationBar';
import { createPhaseHook } from '../phaseHooks/PhaseHooks';
import useDarkModeToggle from './useDarkModeToggle';
import { useDispatch } from 'react-redux';


const usePhaseUI = () => { 
  const dispatch = useNotificationBar;
  const { isDarkMode } = useDarkModeToggle();

  const notify = async (type: NotificationTypeEnum, message: string) => {
    try {
      await dispatch({
        type,
        message,
        isDarkMode
      });
    } catch (error) {
      console.error('Faile to dispatch notification:', error);
}
const axiosInstance = axios.create({
  baseURL: '/api/',
});

const logData: LogData = {
  endpoint: endpoints.notifications,
  method: 'GET',
  status: "200",
  response: {},
  timestamp: new Date,
  level: 'info',
  message: `GET request to ${endpoints.notifications} successful`
};

const fetchData = async (endpoint: string) => {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error;
  }
};

const displayNotification = (notification: NotificationData, addNotification: Function) => {
  const message = notification.data?.message;
  const type = message ? 'info' : 'error';
  const defaultMessage = message || NOTIFICATION_MESSAGES.NO_NOTIFICATIONS.DEFAULT;
  addNotification(defaultMessage, type);
};

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
        date: new Date,
        notificationType: ''
      }, addNotification);
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    addNotification(NotificationMessagesFactory.createErrorMessage('Failed to fetch notifications'), 'error' as NOTIFICATION_TYPES);
  }
};

const fetchUserDataAndDisplayNotification = async (addNotification: Function) => {
  try {
    const userData = await fetchData('user');
    addNotification(NotificationMessagesFactory.createCustomMessage('User data fetched'), 'success');
    return userData;
  } catch (error: any) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

const createDarkModeTogglePhaseHook = () => {
  return createPhaseHook({
    condition: () => true,
    duration: '10000',
    asyncEffect: async () => {
      const { toggleDarkMode, isDarkMode } = useDarkModeToggle();
      console.log('Dark Mode Toggle Phase Hook triggered');
      await fetchData('dark-mode-settings');
      if (!isDarkMode) {
        toggleDarkMode();
      }
      await fetchUserDataAndDisplayNotification(useNotificationBar().addNotification);
      return () => console.log('Cleanup for Dark Mode Toggle Phase');
    },
    name: '',
    isActive: false,
    initialStartIdleTimeout: function (timeoutDuration: number, onTimeout: () => void): void {
      throw new Error('Function not implemented.');
    },
    resetIdleTimeout: function (): void {
      throw new Error('Function not implemented.');
    },
    idleTimeoutId: null,
    clearIdleTimeout: function (): void {
      throw new Error('Function not implemented.');
    },
    onPhaseStart: function (): void {
      throw new Error('Function not implemented.');
    },
    onPhaseEnd: function (): void {
      throw new Error('Function not implemented.');
    },
    startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void): void {
      throw new Error('Function not implemented.');
    },
    cleanup: undefined,
    startAnimation: function (): void {
      throw new Error('Function not implemented.');
    },
    stopAnimation: function (): void {
      throw new Error('Function not implemented.');
    },
    animateIn: function (): void {
      throw new Error('Function not implemented.');
    },
    toggleActivation: function (accessToken?: string | null | undefined): void {
      throw new Error('Function not implemented.');
    }
  });
};

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
    initialStartIdleTimeout: function (timeoutDuration: number, onTimeout: () => void): void {
      throw new Error('Function not implemented.');
    },
    resetIdleTimeout: function (): void {
      throw new Error('Function not implemented.');
    },
    idleTimeoutId: null,
    clearIdleTimeout: function (): void {
      throw new Error('Function not implemented.');
    },
    onPhaseStart: function (): void {
      throw new Error('Function not implemented.');
    },
    onPhaseEnd: function (): void {
      throw new Error('Function not implemented.');
    },
    startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void): void {
      throw new Error('Function not implemented.');
    },
    cleanup: undefined,
    startAnimation: function (): void {
      throw new Error('Function not implemented.');
    },
    stopAnimation: function (): void {
      throw new Error('Function not implemented.');
    },
    animateIn: function (): void {
      throw new Error('Function not implemented.');
    },
    toggleActivation: function (accessToken?: string | null | undefined): void {
      throw new Error('Function not implemented.');
    }
  });
};

const isLoggedIn = () => true;

export const darkModeTogglePhaseHook = createDarkModeTogglePhaseHook();
export const notificationBarPhaseHook = createNotificationBarPhaseHook();
