import axiosInstance from "@/app/api/axiosInstance";
import { HeadersConfig } from "@/app/api/headers/HeadersConfig";
import { AxiosError, AxiosResponse } from "axios";
import { headersConfig } from "../components/shared/SharedHeaders";
import { UserSettings } from "../configs/UserSettings";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";

const API_BASE_URL = endpoints.client;

// Define a function to create headers using the provided configuration
export const createHeaders = (): HeadersConfig => {
  // Access and return the header configurations from HeadersConfig.tsx
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
    // Add more headers as needed
  };
};

interface UserSettingsNotificationMessages {
  FETCH_USER_SETTINGS_SUCCESS: string;
  FETCH_USER_SETTINGS_ERROR: string;
  UPDATE_USER_SETTINGS_SUCCESS: string;
  UPDATE_USER_SETTINGS_ERROR: string;
  DELETE_USER_SETTINGS_SUCCESS: string;
  DELETE_USER_SETTINGS_ERROR: string;
  RESET_USER_SETTINGS_SUCCESS: string;
  RESET_USER_SETTINGS_ERROR: string;
  // Add more keys as needed
}

const userSettingsNotificationMessages: UserSettingsNotificationMessages = {
  FETCH_USER_SETTINGS_SUCCESS: "User settings fetched successfully.",
  FETCH_USER_SETTINGS_ERROR: "Failed to fetch user settings.",
  UPDATE_USER_SETTINGS_SUCCESS: "User settings updated successfully.",
  UPDATE_USER_SETTINGS_ERROR: "Failed to update user settings.",

  DELETE_USER_SETTINGS_SUCCESS: "User settings deleted successfully.",
  DELETE_USER_SETTINGS_ERROR: "Failed to delete user settings.",
  RESET_USER_SETTINGS_SUCCESS: "User settings reset successfully.",
  RESET_USER_SETTINGS_ERROR: "Failed to reset user settings.",
  // Add more properties as needed
};

class ApiUserSettingsService {
  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessage: string
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      // Manage headers in response
      if (response.headers) {
        // Access and manage response headers here using headersConfig
        headersConfig["Authorization"] = response.headers["authorization"];
      }

      // Notify success message
      console.log(successMessage);

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError, errorMessage);
      // Notify error message
      console.error(errorMessage);
      throw error;
    }
  }

  async fetchUserSettings(userId: number): Promise<UserSettings> {
    try {
      const userSettingsUrl = `${API_BASE_URL}/users/${userId}/settings`;

      // Use axiosInstance with the headers configuration
      const response: AxiosResponse = await axiosInstance.get(userSettingsUrl, {
        headers: headersConfig, // Pass headers configuration in the request
      });
      const userSettings: UserSettings = response.data;

      // Notify success message
      console.log(userSettingsNotificationMessages.FETCH_USER_SETTINGS_SUCCESS);

      return userSettings;
    } catch (error) {
      // Handle error and notify failure message
      console.error(userSettingsNotificationMessages.FETCH_USER_SETTINGS_ERROR);
      throw error;
    }
  }

  async updateUserSettings(
    userSettings: UserSettings
  ): Promise<AxiosResponse<UserSettings>> {
    try {
      const userSettingsUrl = `${API_BASE_URL}/users/${userSettings.userId}/settings`;

      // Use axiosInstance with the headers configuration
      const response: AxiosResponse<UserSettings> = await axiosInstance.put(
        userSettingsUrl,
        userSettings,
        {
          headers: headersConfig, // Pass headers configuration in the request
        }
      );

      // Notify success message
      console.log(
        userSettingsNotificationMessages.UPDATE_USER_SETTINGS_SUCCESS
      );

      return response;
    } catch (error) {
      // Handle error and notify failure message
      console.error(
        userSettingsNotificationMessages.UPDATE_USER_SETTINGS_ERROR
      );
      throw error;
    }
  }

  async deleteUserSettings(userId: number): Promise<AxiosResponse> {
    try {
      const userSettingsUrl = `${API_BASE_URL}/users/${userId}/settings`;

      // Use axiosInstance with the headers configuration
      const response: AxiosResponse = await axiosInstance.delete(
        userSettingsUrl,
        {
          headers: headersConfig, // Pass headers configuration in the request
        }
      );

      // Notify success message
      console.log(
        userSettingsNotificationMessages.DELETE_USER_SETTINGS_SUCCESS
      );

      return response;
    } catch (error) {
      // Handle error and notify failure message
      console.error(
        userSettingsNotificationMessages.DELETE_USER_SETTINGS_ERROR
      );
      throw error;
    }
  }

  async resetUserSettings(userId: number): Promise<AxiosResponse> {
    try {
      const userSettingsUrl = `${API_BASE_URL}/users/${userId}/settings/reset`;

      // Use axiosInstance with the headers configuration
      const response: AxiosResponse = await axiosInstance.post(
        userSettingsUrl,
        {},
        {
          headers: headersConfig, // Pass headers configuration in the request
        }
      );

      // Notify success message
      console.log(userSettingsNotificationMessages.RESET_USER_SETTINGS_SUCCESS);

      return response;
    } catch (error) {
      // Handle error and notify failure message
      console.error(userSettingsNotificationMessages.RESET_USER_SETTINGS_ERROR);
      throw error;
    }
  }
}

export default ApiUserSettingsService;
export { userSettingsNotificationMessages };
export type { UserSettingsNotificationMessages };
