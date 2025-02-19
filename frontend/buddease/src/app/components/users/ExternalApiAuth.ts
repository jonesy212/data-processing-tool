// ExternalApiAuth.ts
import { createHeaders } from "@/app/api/ApiClient";
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import dotProp from "dot-prop";
import { useDispatch } from "react-redux";
import authService from "../auth/AuthService";
import { headersConfig } from "../shared/SharedHeaders";
import { sendNotification } from "./UserSlice";

// Define API base URL for authentication endpoints
const AUTH_API_BASE_URL = dotProp.getProperty(endpoints, "externaAuth");

// Dispatch hook for Redux actions
const dispatch = useDispatch();

// Function to handle authentication
export const authenticateUser = async (credentials: any) => {
  try {
    const API_AUTH_ENDPOINT = dotProp.getProperty(
      AUTH_API_BASE_URL,
      "authenticate"
    ) as string;
    if (!API_AUTH_ENDPOINT) {
      throw new Error("Authenticate endpoint not found");
    }

    // Call createHeaders function to get the headers configuration
    const headers = createHeaders();

    // Make a POST request to authenticate the user
    const response = await axiosInstance.post(API_AUTH_ENDPOINT, credentials, {
      headers: headers,
    });

    // Dispatch success action and notify user
    dispatch(sendNotification("User authenticated successfully"));
    return response.data;
  } catch (error) {
    // Dispatch failure action and notify user
    dispatch(sendNotification(`Authentication failed: ${error}`));
    console.error("Authentication failed:", error);
    throw error;
  }
};

// Function to handle user authentication using AuthService
export const loginUser = async (username: string, password: string) => {
  try {
    // Call login method from AuthService
    const { accessToken } = await authService.login(username, password);
    return accessToken;
  } catch (error) {
    console.error("User authentication failed:", error);
    throw error;
  }
};

// Function to handle user logout using AuthService
export const logoutUser = async () => {
  try {
    // Call logout method from AuthService
    await authService.logout();
    // Dispatch success action and notify user
    dispatch(sendNotification("User logged out successfully"))
  } catch (error) {
    dispatch(sendNotification("User logout failed: " + error));
    console.error("User logout failed:", error);
    throw error;
  }
};

// Function to handle password reset
export const resetPassword = async (email: string) => {
  try {
    const API_RESET_PASSWORD_ENDPOINT = dotProp.getProperty(
      AUTH_API_BASE_URL,
      "resetPassword"
    ) as string;
    if (!API_RESET_PASSWORD_ENDPOINT) {
      throw new Error("Reset password endpoint not found");
    }

    // Call createHeaders function to get the headers configuration
    const headers = createHeaders();

    // Make a POST request to reset the user's password
    await axiosInstance.post(
      API_RESET_PASSWORD_ENDPOINT,
      { email },
      {
        headers: headers,
      }
    );

    // Notify user about password reset
    dispatch(
      sendNotification("Password reset instructions sent to your email")
    );
  } catch (error) {
    // Notify user about password reset failure
    dispatch(sendNotification(`Password reset failed: ${error}`));
    console.error("Password reset failed:", error);
    throw error;
  }
};

export const fetchDataWithToken = async (token: string) => { 
    try {
        // Use headersConfig instead of calling createHeaders directly
        const headers = headersConfig;
        // Add authorization header with token 
        headers.Authorization = `Bearer ${token}`;
        // Make a GET request to fetch data
        const response = await axiosInstance.get('/api/data', {
          headers: headers
        });
    } catch (error) {
        // Dispatch failure action and notify user
        dispatch(sendNotification(`Fetching data failed: ${error}`));
        console.error("Fetching data failed:", error);
        throw error;
    }
}

// Function to handle authentication with Wix's API
export const fetchWixAuthenticationAPI = async (credentials: any) => {
  try {
    // Fetch Wix authentication API endpoint from the configuration
    const WIX_AUTH_API_ENDPOINT = dotProp.getProperty(
      AUTH_API_BASE_URL,
      "wixAuthentication"
    ) as string;
    if (!WIX_AUTH_API_ENDPOINT) {
      throw new Error("Wix authentication endpoint not found");
    }

    // Call createHeaders function to get the headers configuration
    const headers = createHeaders();

    // Make a POST request to authenticate with Wix's API
    const response = await axiosInstance.post(
      WIX_AUTH_API_ENDPOINT,
      credentials,
      {
        headers: headers,
      }
    );

    // Dispatch success action and notify user
    dispatch(sendNotification("Successfully authenticated with Wix API"));
    return response.data;
  } catch (error) {
    // Dispatch failure action and notify user
    dispatch(sendNotification(`Wix authentication failed: ${error}`));
    console.error("Wix authentication failed:", error);
    throw error;
  }
};
