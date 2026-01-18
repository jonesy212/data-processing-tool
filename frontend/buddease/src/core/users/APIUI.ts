// APIUI.ts
import { UIActions } from '@/core/actions/UIActions';
import internalApiService from '@/core/api/ApiClient';
import { handleApiError } from '@/core/api/ApiLogs';
import { endpoints } from '@/core/api/endpointConfigurations';
import type{ UserSettings } from '@/core/config/UserSettings';
import  type { DataWithComment } from '@/core/dataIntegration/SafeParseData';
import safeParseData, from '@/core/dataIntegration/SafeParseData';
import { ParsedData } from '@/core/dataIntegration/parseData';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from '@/core/hooks/useErrorHandling';
import ErrorHandler from '@/core/shared/ErrorHandler';
import { useNotification } from '@/core/state/context/NotificationContext';

import type { UserData } from '@/core/users/User';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import type { Component, ErrorInfo, ReactNode } from '@/core/shared/ErrorHandler';
import React from '@/core/shared/ErrorHandler';


// Define the API base URL for UI
const UI_API_BASE_URL = endpoints.ui;

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
};

// ✅ NEW: Create UIApiService class following the same pattern
class UIApiService {
    notify: (
        id: string,
        message: string,
        data: any,
        date: Date,
        type: string
    ) => void;

    constructor(
        notify: (
            id: string,
            message: string,
            data: any,
            date: Date,
            type: string
        ) => void
    ) {
        this.notify = notify;
    }

    // ✅ ADD: Request handler following the same pattern
    private async requestHandler(
        request: () => Promise<AxiosResponse>,
        successMessageId: keyof UINotificationMessages,
        errorMessageId: keyof UINotificationMessages
    ): Promise<AxiosResponse> {
      try {
          const response: AxiosResponse = await request();
          this.notify(
              successMessageId,
              uiApiNotificationMessages[successMessageId],
              response.data,
              new Date(),
              "Success"
          );
          return response;
      } catch (error: any) {
          handleApiError(error, uiApiNotificationMessages[errorMessageId]);
          throw error;
      }
    }

    // In your UIApiService methods, update to use the endpoints:
    async fetchUserData(userId: string): Promise<UserData> {
        try {
            const endpoint = endpoints.ui.userData(userId);
            const response = await this.requestHandler(
            () => internalApiService.get(endpoint.path),
            "FETCH_USER_SETTINGS_SUCCESS" as keyof UINotificationMessages,
            "FETCH_USER_SETTINGS_ERROR"
            );
            return response.data;
        } catch (error) {
            const { handleError } = useErrorHandling();
            handleError('Failed to fetch user data');
            throw error;
        }
    }

    async updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
    try {
        await this.requestHandler(
            () => internalApiService.put(`${UI_API_BASE_URL}/user/${userId}/settings`, settings),
            "UPDATE_USER_SETTINGS_SUCCESS" as keyof UINotificationMessages,
            "UPDATE_USER_SETTINGS_ERROR"
        );
        
        UIActions.setNotification({
            message: 'User settings updated successfully',
            type: 'success',
        });
    } catch (error) {
        const { handleError } = useErrorHandling();
        handleError('Failed to update user settings');
        throw error;
    }
  }

  // ✅ UPDATE: Use internalApiService for UI data
  async fetchUIData(endpoint: string, requestData: any): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.post(endpoint, requestData),
            "FETCH_INTERFACE_CONTENT_SUCCESS" as keyof UINotificationMessages,
            "FETCH_INTERFACE_CONTENT_ERROR"
        );
        return response.data;
    } catch (error: any) {
        console.error('Error fetching UI data:', error.message);
        throw error;
    }
  }

  // ✅ UPDATE: Use internalApiService for branding data
  async fetchBrandingData(): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.get(`${UI_API_BASE_URL}/branding`),
            "FETCH_INTERFACE_CONTENT_SUCCESS" as keyof UINotificationMessages,
            "FETCH_INTERFACE_CONTENT_ERROR"
        );
        return response.data;
    } catch (error: any) {
        console.error('Error fetching branding data:', error.message);
        throw error;
    }
  }

  // ✅ ADD: User dashboard methods
  async fetchUserDashboard(userId: string): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.get(`${UI_API_BASE_URL}/user/${userId}/dashboard`),
            "FETCH_USER_DASHBOARD_SUCCESS" as keyof UINotificationMessages,
            "FETCH_USER_DASHBOARD_ERROR"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: User widgets methods
  async fetchUserWidgets(userId: string): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.get(`${UI_API_BASE_URL}/user/${userId}/widgets`),
            "FETCH_USER_WIDGETS_SUCCESS" as keyof UINotificationMessages,
            "FETCH_USER_WIDGETS_ERROR"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: User themes methods
  async fetchUserThemes(): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.get(`${UI_API_BASE_URL}/themes`),
            "FETCH_USER_THEMES_SUCCESS" as keyof UINotificationMessages,
            "FETCH_USER_THEMES_ERROR"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: User preferences methods
  async fetchUserPreferences(userId: string): Promise<any> {
    try {
        const response = await this.requestHandler(
            () => internalApiService.get(`${UI_API_BASE_URL}/user/${userId}/preferences`),
            "FETCH_USER_PREFERENCES_SUCCESS" as keyof UINotificationMessages,
            "FETCH_USER_PREFERENCES_ERROR"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: Update user preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
        await this.requestHandler(
            () => internalApiService.put(`${UI_API_BASE_URL}/user/${userId}/preferences`, preferences),
            "UPDATE_USER_PREFERENCES_SUCCESS" as keyof UINotificationMessages,
            "UPDATE_USER_PREFERENCES_ERROR"
        );
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: Dark mode toggle
  async toggleDarkMode(userId: string, darkMode: boolean): Promise<void> {
    try {
        await this.requestHandler(
            () => internalApiService.put(`${UI_API_BASE_URL}/user/${userId}/dark-mode`, { darkMode }),
            "UPDATE_USER_PREFERENCES_SUCCESS" as keyof UINotificationMessages,
            "TOGGLE_DARK_MODE_ERROR"
        );
    } catch (error) {
        throw error;
    }
  }

  // ✅ ADD: User avatar methods
  async fetchUserAvatar(userId: string): Promise<any> {
      try {
          const response = await this.requestHandler(
              () => internalApiService.get(`${UI_API_BASE_URL}/user/${userId}/avatar`),
              "FETCH_USER_AVATAR_SUCCESS" as keyof UINotificationMessages,
              "FETCH_USER_AVATAR_ERROR"
          );
          return response.data;
      } catch (error) {
          throw error;
      }
  }

  async updateUserAvatar(userId: string, avatarData: any): Promise<void> {
    try {
        await this.requestHandler(
            () => internalApiService.put(`${UI_API_BASE_URL}/user/${userId}/avatar`, avatarData),
            "UPDATE_USER_AVATAR_SUCCESS" as keyof UINotificationMessages,
            "UPDATE_USER_AVATAR_ERROR"
        );
    } catch (error) {
        throw error;
    }
  }
}

// Function to safely parse data with error handling
const parseDataWithErrorHandling = <T extends DataWithComment<T>>(
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

// Function to handle UIAPI errors and notify
const handleUiApiErrorAndNotify = (
    error: AxiosError<any>,
    errorMessage: string,
    errorMessageId: keyof UINotificationMessages
) => {
    handleApiError(error, errorMessage);
    
    if (errorMessageId) {
        const errorMessageText = uiApiNotificationMessages[errorMessageId];
        
        useNotification().notify({
            id: errorMessageId.toString(),
            message: errorMessageText,
            data: {
                originalError: error.message || 'Unknown error',
                entityType: 'ui',
                extra: {
                    errorMessage,
                    errorDetails: error.response?.data,
                    status: error.response?.status
                }
            },
            timestamp: new Date(),
            type: NotificationTypeEnum.API_ERROR,   
            level: 'error' as const
        });
    }
};

// ✅ CREATE: Instance of UIApiService
const uiApiService = new UIApiService(useNotification);

// ✅ EXPORT: The service instance and legacy functions for backward compatibility
export default uiApiService;

// Legacy exports for backward compatibility
export {
    uiApiService as fetchBrandingData, uiApiService as fetchUIData, uiApiService as fetchUserData, handleUiApiErrorAndNotify, parseDataWithErrorHandling, uiApiService as UIApi, uiApiNotificationMessages, uiApiService as updateUserSettings
};
