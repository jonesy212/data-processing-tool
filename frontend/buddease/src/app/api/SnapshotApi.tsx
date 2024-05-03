import { AxiosError } from "axios";
import { Data } from "../components/models/data/Data";
import SnapshotList from "../components/snapshots/SnapshotList";
import { Snapshot } from "../components/snapshots/SnapshotStore";
import { AppConfig, getAppConfig } from "../configs/AppConfig";
import configData from "../configs/configData";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import { AuthenticationHeaders, createAuthenticationHeaders } from "./headers/authenticationHeaders";
import createCacheHeaders from "./headers/cacheHeaders";
import createContentHeaders from "./headers/contentHeaders";
import generateCustomHeaders from "./headers/customHeaders";
import createRequestHeaders from "./headers/requestHeaders";

const API_BASE_URL = endpoints.snapshots.list; // Assigning string value directly


const appConfig: AppConfig = getAppConfig();

// Updated handleSpecificApplicationLogic and handleOtherApplicationLogic functions
const handleSpecificApplicationLogic = (appConfig: AppConfig, statusCode: number) => {
  switch (statusCode) {
    case 200:
      console.log(`Handling specific application logic for status code 200 in ${appConfig.appName}`);
      // Additional application logic specific to status code 200
      break;
    case 404:
      console.log(`Handling specific application logic for status code 404 in ${appConfig.appName}`);
      // Additional application logic specific to status code 404
      break;
    // Add more cases for other specific status codes as needed
    default:
      console.log(`No specific application logic for status code ${statusCode} in ${appConfig.appName}`);
      break;
  }
};

const handleOtherApplicationLogic = (appConfig: AppConfig, statusCode: number) => {
  if (statusCode >= 400 && statusCode < 500) {
    console.log(`Handling client-related application logic for status code ${statusCode} in ${appConfig.appName}`);
    // Additional application logic for client-related errors (4xx)
  } else if (statusCode >= 500 && statusCode < 600) {
    console.log(`Handling server-related application logic for status code ${statusCode} in ${appConfig.appName}`);
    // Additional application logic for server-related errors (5xx)
  } else {
    console.log(`No specific application logic for status code ${statusCode} in ${appConfig.appName}`);
    // Additional application logic for other status codes if needed
  }
};


const handleSpecificStatusCode = (appConfig: AppConfig, statusCode: number) => {
  switch (statusCode) {
    case 200:
      console.log("Handling specific status code: 200");
      // Additional logic specific to handling status code 200
      break;
    case 404:
      console.log("Handling specific status code: 404");
      // Additional logic specific to handling status code 404
      break;
    // Add more cases for other specific status codes as needed
    default:
      console.log(`Unhandled specific status code: ${statusCode}`);
      break;
  }
};

const handleOtherStatusCodes = (appConfig: AppConfig, statusCode: number) => {
  if (statusCode >= 400 && statusCode < 500) {
    console.log(`Handling client error status code: ${statusCode}`);
    // Additional logic for handling client errors (4xx)
  } else if (statusCode >= 500 && statusCode < 600) {
    console.log(`Handling server error status code: ${statusCode}`);
    // Additional logic for handling server errors (5xx)
  } else {
    console.log(`Unhandled status code: ${statusCode}`);
    // Additional logic for handling other status codes if needed
  }
};

export const addSnapshot = async (newSnapshot: Omit<Snapshot<Data>, 'id'>) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
      accessToken, 
      userId,
      currentAppVersion
    );

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ''),
      // Add other header objects as needed
    ];

    const headers = Object.assign({}, ...headersArray);

    const response = await axiosInstance.post(`${API_BASE_URL}`, newSnapshot, {
      headers: headers as Record<string, string>,
    });

    if (response.status === 200) {
      // Handle successful response
      if (typeof response.data === 'string' && response.headers['content-type'] === 'application/json') {
        const numericData = parseInt(response.data, 10); // Convert string to number
        if (!isNaN(numericData)) {
          // Pass additional argument for statusCode
          handleSpecificApplicationLogic(appConfig, numericData);
        } else {
          // Handle the case where response.data is not a valid number
          console.error('Response data is not a valid number:', response.data);
        }
      } else {
        // Code for other types of applications
        handleOtherApplicationLogic(appConfig, response.data);
      }
      // Handle other status codes
      if (response.status === 200 && response.data) {
        // Pass additional argument for statusCode
        handleSpecificStatusCode(appConfig, response.status);
      } else {
        // Code for handling other status codes
        handleOtherStatusCodes(appConfig, response.status);
      }
    }
  } catch (error) {
    const errorMessage = "Failed to add snapshot";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

export const fetchSnapshotById = async (snapshotId: number): Promise<Snapshot<Data>> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
      accessToken,
      userId,
      currentAppVersion
    );

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ''),
      // Add other header objects as needed
    ];

    const headers = Object.assign({}, ...headersArray);

    const response = await axiosInstance.get<Snapshot<Data>>(`${API_BASE_URL}/${snapshotId}`, {
      headers: headers as Record<string, string>,
    });

    return response.data;
  } catch (error) {
    const errorMessage = "Failed to fetch snapshot by ID";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

export const fetchAllSnapshots = async (): Promise<SnapshotList> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
      accessToken,
      userId,
      currentAppVersion
    );

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ''),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.get<SnapshotList>(`${API_BASE_URL}`, {
      headers: headers as Record<string, string>,
    });
    return response.data;
  } catch (error: any) {
    handleApiError(error as AxiosError<unknown>, "Failed to fetch all snapshots");
    throw error;
  }
}

export const getSortedList = async (target: string): Promise<SnapshotList> => {
  try {
    const snapshotsList = await fetchAllSnapshots(target); // Pass the target parameter to fetchAllSnapshots
    snapshotsList.sortSnapshotItems(); // Optional: Sort snapshots within the SnapshotList object
    return snapshotsList;
  } catch (error) {
    const errorMessage = "Failed to get sorted list of snapshots";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw new Error(errorMessage);
  }
};



export const removeSnapshot = async (snapshotId: number): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(
      accessToken,
      userId,
      currentAppVersion
    );

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ''),
      // Add other header objects as needed
    ];

    const headers = Object.assign({}, ...headersArray);

    await axiosInstance.delete(`${API_BASE_URL}/${snapshotId}`, {
      headers: headers as Record<string, string>,
    });
  } catch (error) {
    const errorMessage = "Failed to update client details";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
}
