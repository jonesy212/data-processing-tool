import { AxiosError } from "axios";
import { authToken } from "../components/auth/authToken";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { Content } from "../components/models/content/AddContent";
import { BaseData, Data } from "../components/models/data/Data";
import { PriorityTypeEnum, ProjectStateEnum } from "../components/models/data/StatusType";
import { Member } from "../components/models/teams/TeamMembers";
import { ProjectType } from "../components/projects/Project";
import { Snapshot, Snapshots } from "../components/snapshots/LocalStorageSnapshotStore";
import SnapshotList from "../components/snapshots/SnapshotList";
import { NotificationTypeEnum, useNotification } from "../components/support/NotificationContext";
import { AppConfig, getAppConfig } from "../configs/AppConfig";
import configData from "../configs/configData";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import { Target, constructTarget } from "./EndpointConstructor";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
import {
  AuthenticationHeaders,
  createAuthenticationHeaders,
} from "./headers/authenticationHeaders";
import createCacheHeaders from "./headers/cacheHeaders";
import createContentHeaders from "./headers/contentHeaders";
import generateCustomHeaders from "./headers/customHeaders";
import createRequestHeaders from "./headers/requestHeaders";
import { resolve } from "path";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { K } from "../components/snapshots/SnapshotConfig";
import React from "react";


const API_BASE_URL = endpoints.snapshots.list; // Assigning string value directly

const appConfig: AppConfig = getAppConfig();


// Define API notification messages for snapshot operations
interface SnapshotNotificationMessages {
  CREATE_SNAPSHOT_SUCCESS: string;
  CREATE_SNAPSHOT_ERROR: string;
  // Add more keys as needed
}

const snapshotNotificationMessages: SnapshotNotificationMessages = {
  CREATE_SNAPSHOT_SUCCESS: "Snapshot created successfully",
  CREATE_SNAPSHOT_ERROR: "Failed to create snapshot",
  // Add more messages as needed
};

// 


const handleSnapshotApiError = (error: AxiosError<unknown>, customMessage: string) => {
  const { handleError } = useErrorHandling();
  
  let errorMessage = customMessage;

  if (error.response) {
    errorMessage += `: ${error.response.data}`;
  } else if (error.request) {
    errorMessage += ": No response received from the server.";
  } else {
    errorMessage += `: ${error.message}`;
  }

  handleError(errorMessage);
};


// Updated handleSpecificApplicationLogic and handleOtherApplicationLogic functions
const handleSpecificApplicationLogic = (
  appConfig: AppConfig,
  statusCode: number
) => {
  switch (statusCode) {
    case 200:
      console.log(
        `Handling specific application logic for status code 200 in ${appConfig.appName}`
      );
      // Additional application logic specific to status code 200
      break;
    case 404:
      console.log(
        `Handling specific application logic for status code 404 in ${appConfig.appName}`
      );
      // Additional application logic specific to status code 404
      break;
    // Add more cases for other specific status codes as needed
    default:
      console.log(
        `No specific application logic for status code ${statusCode} in ${appConfig.appName}`
      );
      break;
  }
};

export const findSubscriberById = async (
  subscriberId: string,
  category: string
): Promise<Member> => {
  const target: Target = constructTarget(
    category,
    `${endpoints.members.list}?subscriberId=${subscriberId}`
  );
  const headers: Record<string, any> = createRequestHeaders(String(target.url));

  if (!target.url) {
    throw new Error("Target URL is undefined");
  }
  
  const response = await axiosInstance.get(target.url, {
    headers: headers as Record<string, string>,
  });  return response.data;
};



// Create snapshot
export const createSnapshot = async <T extends Data, K extends Data>(snapshot: Snapshot<T, K>): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const appVersion = configData.currentAppVersion;

    const headersArray = [
      createAuthenticationHeaders(token, userId, appVersion),
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(token || ""),
    ];

    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.post("/snapshots", snapshot, { headers: headers as Record<string, string> });

    if (response.status === 201) {
      console.log("Snapshot created successfully:", response.data);
    } else {
      console.error("Failed to create snapshot. Status:", response.status);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to create snapshot");
    throw error;
  }
};

const handleOtherApplicationLogic = (
  appConfig: AppConfig,
  statusCode: number
) => {
  if (statusCode >= 400 && statusCode < 500) {
    console.log(
      `Handling client-related application logic for status code ${statusCode} in ${appConfig.appName}`
    );
    // Additional application logic for client-related errors (4xx)
  } else if (statusCode >= 500 && statusCode < 600) {
    console.log(
      `Handling server-related application logic for status code ${statusCode} in ${appConfig.appName}`
    );
    // Additional application logic for server-related errors (5xx)
  } else {
    console.log(
      `No specific application logic for status code ${statusCode} in ${appConfig.appName}`
    );
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



export const addSnapshot = async <T extends Data, K extends Data>(newSnapshot: Omit<Snapshot<T, K>, "id">): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const appVersion = configData.currentAppVersion;

    const headersArray = [
      createAuthenticationHeaders(token, userId, appVersion),
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(token || ""),
    ];

    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.post("/snapshots", newSnapshot, { headers: headers as Record<string, string> });

    if (response.status === 201) {
      console.log("Snapshot added successfully:", response.data);
    } else {
      console.error("Failed to add snapshot. Status:", response.status);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to add snapshot");
    throw error;
  }
};

export const addSnapshotSuccess = async (newSnapshot: Omit<Snapshot<Data>, "id">) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion; 
    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);
    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.post(`${API_BASE_URL}`, newSnapshot, {
      headers: headers as Record<string, string>,
    });
    if (response.status === 200) {
      // Handle successful response
      if (
        typeof response.data === "string" &&
        response.headers["content-type"] === "application/json"
      ) {
        const numericData = parseInt(response.data, 10); // Convert string to number
        if (!isNaN(numericData)) {
          // Pass additional argument for statusCode
          handleSpecificApplicationLogic(appConfig, numericData);
        } else {
          // Handle the case where response.data is not a valid number
          console.error("Response data is not a valid number:", response.data);
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
      return response.data;
    }
  }catch (error) {
    const errorMessage = "Failed to add snapshot";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
}


export const getSnapshots = async (category: string) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;
    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);
    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.get(
      `${API_BASE_URL}?category=${category}`,
      {
        headers: headers as Record<string, string>,
      }
    );
    if (response.status === 200) {
      // Handle successful response
      if (
        typeof response.data === "string" &&
        response.headers["content-type"] === "application/json"
      ) {
        const numericData = parseInt(response.data, 10); // Convert string to number
        if (!isNaN(numericData)) {
          // Pass additional argument for statusCode
          handleSpecificApplicationLogic(appConfig, numericData);
        } else {
          // Handle the case where response.data is not a valid number
          console.error("Response data is not a valid number:", response.data);
          // Handle other status codes
          handleOtherStatusCodes(appConfig, response.status);
        }
      }
      return response.data;
    }
  } catch (error) {
    const errorMessage = "Failed to get snapshots";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
}


export const mergeSnapshots = async (
  snapshots: Snapshots<any>,
  category: string
): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const currentAppVersion = configData.currentAppVersion;

    // Create authentication headers
    const authenticationHeaders = createAuthenticationHeaders(
      accessToken,
      userId,
      currentAppVersion
    );

    // Other headers
    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ''),
      // Add other header objects as needed
    ];

    const headers = Object.assign({}, ...headersArray);

    const payload = {
      snapshots,
      category,
    };

    const response = await axiosInstance.post(`${API_BASE_URL}/merge`, payload, {
      headers: headers as Record<string, string>,
    });

    if (response.status === 200) {
      console.log('Snapshots merged successfully:', response.data);
      // Handle successful merge if needed
    } else {
      console.error('Failed to merge snapshots. Status:', response.status);
      // Handle error cases
    }
  } catch (error) {
    const errorMessage = 'Failed to merge snapshots';
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

// Fetch snapshot by ID
export const fetchSnapshotById = <T extends Data, K extends Data>(snapshotId: string): Promise<Snapshot<T, K>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const appVersion = configData.currentAppVersion;
  
      const headersArray = [
        createAuthenticationHeaders(token, userId, appVersion),
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(token || ""),
      ];
  
      const headers = Object.assign({}, ...headersArray);
      const response = await axiosInstance.get(`/snapshots/${snapshotId}`, { headers: headers as Record<string, string> });
  
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(new Error("Failed to fetch snapshot by ID"));
      }
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch snapshot by ID");
      reject(error);
    }
  });
};





export const fetchAllSnapshots = async (
  target: SnapshotList
): Promise<SnapshotList> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.get<SnapshotList>(
      `${API_BASE_URL}/${target}`, // Assuming target is a valid URL string
      {
        headers: headers,
      }
    );
    return response.data;
  } catch (error: any) {
    handleApiError(
      error as AxiosError<unknown>,
      "Failed to fetch all snapshots"
    );
    throw error;
  }
};


export const fetchSnapshotStoreData = async (
  snapshotId: string
): Promise<SnapshotStore<Data, K>> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);

    const response = await axiosInstance.get<SnapshotStore<Data, K>>(
      // Assuming target is a valid URL string
      `${API_BASE_URL}/snapshots/${snapshotId}`,
      {
        headers: headers,
      }
    );

    return response.data;
  } catch (error: any) {
    handleApiError(
      error as AxiosError<unknown>,
      "Failed to fetch snapshot store data"
    );
    throw error;
  }
};

export const takeSnapshot =  <T extends Data>(
  target: SnapshotList | Content<T>,
  date?: Date,
  projectType?: ProjectType,
  projectId?: string,
  projectState?: ProjectStateEnum,
  projectPriority?: PriorityTypeEnum,
  projectMembers?: Member[]
): Promise<Snapshot<T, Data>> => {
  return new Promise(async (resolve, reject) => {
  
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const currentAppVersion = configData.currentAppVersion;
      const authenticationHeaders = createAuthenticationHeaders(accessToken, userId, currentAppVersion);
      const headersArray = [
        authenticationHeaders,
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(accessToken || ""),
        // Add other header objects as needed
      ];
      const headers = Object.assign({}, ...headersArray);

      let url = '';
      let data: any = {};

      if ('projectType' in target) {
        url = `${API_BASE_URL}/snapshotListEndpoint`;
        data = {
          date,
          projectType,
          projectId,
          projectState,
          projectPriority,
          projectMembers
        };
      } else if ('title' in target) {
        url = `${API_BASE_URL}/contentEndpoint`; // Replace with your actual endpoint
        data = {
          content: target
        };
      } else {
        throw new Error('Invalid target');
      }

      const response = await axiosInstance.post(url, data, { headers });
      if (response.status === 200) {
        resolve(response.data);
        return response.data;
      }
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      reject(error);
      throw error;
    }
  })

};


export const saveSnapshotToDatabase = async (snapshotData: any): Promise<boolean> => {
  try {
      const saveSnapshotEndpoint = `${API_BASE_URL}/save`; // Assuming the save endpoint is properly defined
      await axiosInstance.post(saveSnapshotEndpoint, snapshotData, {
          headers: headersConfig, // Assuming headersConfig is properly defined
      });

      // Assuming you have a notification system to notify about successful save
      useNotification().notify(
          "SaveSnapshotSuccessId",
          snapshotNotificationMessages.CREATE_SNAPSHOT_SUCCESS,
          null,
          new Date(),
          NotificationTypeEnum.Success
      );

      // Return true to indicate successful saving
      return true;
  } catch (error: any) {
      console.error("Error saving snapshot to database:", error);
      // Assuming there's a function to handle API errors and notify the user
      handleSnapshotApiError(error as AxiosError<unknown>, "Failed to save snapshot to database");
      // Return false to indicate failure
      return false;
  }
};

// Update the getSortedList function to accept the Target type
export const getSortedList = async (target: Target): Promise<SnapshotList> => {
  try {
    // Destructure the target object to extract the endpoint and params
    const { endpoint, params } = target;

    // Construct the target URL using the endpoint and params
    const constructedTarget = constructTarget("apiWebBase", endpoint, params);

    // Fetch snapshots using the constructed target
    const snapshotsList = await fetchAllSnapshots(constructedTarget.toArray()); 

    // Optional: Sort snapshots within the SnapshotList object
    snapshotsList.sortSnapshotItems();

    // Return the sorted snapshot list
    return snapshotsList;
  } catch (error) {
    // Handle errors
    const errorMessage = "Failed to get sorted list of snapshots";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw new Error(errorMessage);
  }
};

export const removeSnapshot = async (snapshotId: number): Promise<void> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;

    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);

    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
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
};



// Get snapshot ID by some criteria
export const getSnapshotId = <T, K>(criteria: any): Promise<string | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const appVersion = configData.currentAppVersion;
  
      const headersArray = [
        createAuthenticationHeaders(token, userId, appVersion),
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(token || ""),
      ];
  
      const headers = Object.assign({}, ...headersArray);
      const response = await axiosInstance.get(`/snapshots`, {
        headers: headers as Record<string, string>,
        params: criteria,
      })
  
      if (response.status === 200 && response.data.length > 0) {
        resolve(response.data[0].id);
      } else {
        reject(new Error("Failed to retrieve snapshot ID"));
      }
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to get snapshot ID");
      reject(error);
    }
  });
};

export const snapshotContainer = async (snapshotId: string): Promise<SnapshotContainer> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;
    // const snapshotId = "5f9666666666666666666666";
    const authenticationHeaders: AuthenticationHeaders =
      createAuthenticationHeaders(accessToken, userId, currentAppVersion);
    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.get<SnapshotContainer>(
      `${API_BASE_URL}/${snapshotId}/container`,
      {
        headers: headers as Record<string, string>,
      }
    );
  }catch (error) {
    const errorMessage = "Failed to get snapshot container";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }

export const fetchSnapshotIds = async (): Promise<string[]> => {
  try {
    // Define the endpoint for fetching snapshot IDs
    const fetchSnapshotIdsEndpoint = `${API_BASE_URL}/snapshotIds`;

    // Make an API call to fetch snapshot IDs
    const response = await axiosInstance.get<string[]>(fetchSnapshotIdsEndpoint, {
      headers: headersConfig, // Include any necessary headers
    });

    // Return the snapshot IDs from the response
    return response.data;
  } catch (error) {
    const errorMessage = "Failed to fetch snapshot IDs";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw new Error(errorMessage);
  }
};