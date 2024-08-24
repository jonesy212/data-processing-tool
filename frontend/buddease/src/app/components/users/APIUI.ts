// APIUI.ts
import { endpoints } from '@/app/api/ApiEndpoints';
import { handleApiError } from '@/app/api/ApiLogs';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { UserSettings } from '@/app/configs/UserSettings';
import ErrorHandler from '@/app/shared/ErrorHandler';
import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { ErrorInfo } from 'react';
import { UIActions } from '../actions/UIActions';
import safeParseData, { DataWithComment } from '../crypto/SafeParseData';
import { ParsedData } from '../crypto/parseData';
import useErrorHandling from '../hooks/useErrorHandling';
import axiosInstance from '../security/csrfToken';
import { UserData } from './User';

// Define the API base URL for UI
const UI_API_BASE_URL = endpoints.ui;

// Define the allowed gesture formats
const allowedGestureFormats = ['tap', 'swipe', 'pinch'];

// Define UIAPI notification messages
// Define UI API notification messages
interface UINotificationMessages {
    FETCH_INTERFACE_CONTENT_ERROR: string;
    UPDATE_INTERFACE_SETTINGS_ERROR: string;
    FETCH_USER_DASHBOARD_ERROR: string;
    UPDATE_USER_DASHBOARD_LAYOUT_ERROR: string;
    FETCH_USER_WIDGETS_ERROR: string;
    CUSTOMIZE_USER_WIDGET_ERROR: string;
    FETCH_USER_THEMES_ERROR: string;
    SWITCH_USER_THEME_ERROR: string;
    FETCH_USER_PREFERENCES_ERROR: string;
    UPDATE_USER_PREFERENCES_ERROR: string;
    FETCH_USER_NOTIFICATIONS_ERROR: string;
    MARK_NOTIFICATION_AS_READ_ERROR: string;
    CLEAR_ALL_NOTIFICATIONS_ERROR: string;
    FETCH_USER_MESSAGES_ERROR: string;
    SEND_MESSAGE_TO_USER_ERROR: string;
    TOGGLE_DARK_MODE_ERROR: string;
    FETCH_USER_AVATAR_ERROR: string;
    UPDATE_USER_AVATAR_ERROR: string;
    FETCH_USER_SETTINGS_ERROR: string;
    UPDATE_USER_SETTINGS_ERROR: string;
    // Add more keys as needed
  }
  
  const uiApiNotificationMessages: UINotificationMessages = {
    FETCH_INTERFACE_CONTENT_ERROR: 'Failed to fetch interface content',
    UPDATE_INTERFACE_SETTINGS_ERROR: 'Failed to update interface settings',
    FETCH_USER_DASHBOARD_ERROR: 'Failed to fetch user dashboard',
    UPDATE_USER_DASHBOARD_LAYOUT_ERROR: 'Failed to update user dashboard layout',
    FETCH_USER_WIDGETS_ERROR: 'Failed to fetch user widgets',
    CUSTOMIZE_USER_WIDGET_ERROR: 'Failed to customize user widget',
    FETCH_USER_THEMES_ERROR: 'Failed to fetch user themes',
    SWITCH_USER_THEME_ERROR: 'Failed to switch user theme',
    FETCH_USER_PREFERENCES_ERROR: 'Failed to fetch user preferences',
    UPDATE_USER_PREFERENCES_ERROR: 'Failed to update user preferences',
    FETCH_USER_NOTIFICATIONS_ERROR: 'Failed to fetch user notifications',
    MARK_NOTIFICATION_AS_READ_ERROR: 'Failed to mark notification as read',
    CLEAR_ALL_NOTIFICATIONS_ERROR: 'Failed to clear all notifications',
    FETCH_USER_MESSAGES_ERROR: 'Failed to fetch user messages',
    SEND_MESSAGE_TO_USER_ERROR: 'Failed to send message to user',
    TOGGLE_DARK_MODE_ERROR: 'Failed to toggle dark mode',
    FETCH_USER_AVATAR_ERROR: 'Failed to fetch user avatar',
    UPDATE_USER_AVATAR_ERROR: 'Failed to update user avatar',
    FETCH_USER_SETTINGS_ERROR: 'Failed to fetch user settings',
    UPDATE_USER_SETTINGS_ERROR: 'Failed to update user settings',
    // Add more properties as needed
  };
  

// Function to handle UIAPI errors and notify
const handleUiApiErrorAndNotify = (
    error: AxiosError<any>,
    errorMessage: string,
    errorMessageId: string
  ) => {
    handleApiError(error, errorMessage);
    if (errorMessageId) {
      const errorMessageText = dotProp.getProperty(uiApiNotificationMessages, errorMessageId);
      useNotification().notify(
        errorMessageId,
        errorMessageText as unknown as string,
        null,
        new Date(),
        'UIAPIError' as NotificationTypeEnum
      );
    }
  };



// Function to safely parse data with error handling

const parseDataWithErrorHandling = <T extends DataWithComment>(
  data: T[],
  threshold: number
): ParsedData<T>[] => {
  try {
    return safeParseData<T>(data, threshold);
  } catch (error: any) {
    const errorMessage = "Error parsing data";
    const errorInfo: ErrorInfo = { componentStack: error.stack };
    ErrorHandler.logError(new Error(errorMessage), errorInfo);
    return [];
  }
};
  
// Updated UIApi with error handling and logging
export const UIApi = {
  fetchUserData: async (userId: string): Promise<UserData> => {
    try {
      const userDataEndpoint = `${`${UI_API_BASE_URL}`}/user/${userId}`;
      const response = await axiosInstance.get<UserData>(userDataEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      // Handle error using useErrorHandling hook
      const { handleError } = useErrorHandling();
      handleError('Failed to fetch user data');
      throw error;
    }
  },

  updateUserSettings: async (userId: string, settings: UserSettings): Promise<void> => {
    try {
      const updateUserSettingsEndpoint = `${UI_API_BASE_URL}/user/${userId}/settings`;
      await axiosInstance.put(updateUserSettingsEndpoint, settings, {
        headers: headersConfig,
      });
      // Optionally, you can notify the user that settings were updated successfully
      UIActions.setNotification({
        message: 'User settings updated successfully',
        type: 'success',
      });
    } catch (error) {
      // Handle error using useErrorHandling hook
      const { handleError } = useErrorHandling();
      handleError('Failed to update user settings');
      throw error;
    }
  },  // Add more UI API functions as needed
  

  // Define the fetchUIData function to fetch additional data or perform an API call
  fetchUIData: async (endpoint: string, requestData: any) => {
    try {
      // Perform API call using fetch or axios
      const response = await fetch(endpoint, {
        method: 'POST', // Adjust the method as needed
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Failed to fetch UI data');
      }

      // Parse the response data as needed
      const responseData = await response.json();

      // Handle the response data, update state, dispatch actions, etc.
      console.log('Fetched UI data:', responseData);
    } catch (error: any) {
      console.error('Error fetching UI data:', error.message);
      // Optionally, handle the error and notify the user
    }
  },

  fetchBrandingData: async () => {
    try {
      const brandingDataEndpoint = `${UI_API_BASE_URL}/branding`;
      const response = await fetch(brandingDataEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch branding data');
      }
      const responseData = await response.json();
      console.log('Fetched branding data:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error fetching branding data:', error.message);
      // Optionally, handle the error and notify the user
    }
  }
};
  





// // Define the component function
// const YourComponent: React.FC = () => {
//   // Define state using useState hook
//   const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

//   // Define the handlePointerDown function
//   const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
//     // Logic for pointer down event
//     console.log('Pointer down');

//     // Example: Set isPointerDown state to true
//     UIActions.setIsPointerDown(true);

//     // Example 1: Change the background color of the div
//     event.currentTarget.style.backgroundColor = 'lightblue';

//     // Example 2: Fetch additional data or perform an API call
   
//     // Example 3: Update the state to track the pointer position
//     const newPointerPosition = { x: event.clientX, y: event.clientY };
//     setPointerPosition(newPointerPosition);

//     // Example 4: Trigger a navigation or route change
//     // history.push('/new-route');

//     // Example 5: Dispatch a Redux action
//     // dispatch({ type: 'POINTER_DOWN', payload: { event } });
//   };

//   // Define the handlePointerMove function
//   const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
//     // Logic for pointer move event
//     console.log('Pointer moved');

//     // Example: Track pointer position
//     const newPointerPosition = {
//       x: event.clientX,
//       y: event.clientY,
//     };

//     // Example: Update pointer position state using action
//     UIActions.setPointerPosition(newPointerPosition);

//     // Example: Call UIActions to update pointer position
//     // UIActions.setPointerPosition(newPointerPosition);

//     // Prevent default pointer behavior like text selection
//     event.preventDefault();
//     // Additional logic for pointer move event
  // }
// }
