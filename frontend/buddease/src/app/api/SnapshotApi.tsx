import { AxiosError } from "axios";
import { authToken } from "../components/auth/authToken";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { Content } from "../components/models/content/AddContent";
import { Data } from "../components/models/data/Data";
import { PriorityTypeEnum, ProjectStateEnum } from "../components/models/data/StatusType";
import { Member } from "../components/models/teams/TeamMembers";
import { ProjectType } from "../components/projects/Project";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
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


export const createSnapshot = (
  snapshot: Snapshot<Data>
) => {
  const headersArray: Array<Record<string, string>> = [];
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const appVersion = configData.currentAppVersion;
  const authenticationHeaders: AuthenticationHeaders = {
    'Content-Type': 'application/json',
    'X-App-Version': appVersion,
    ...createAuthenticationHeaders(token, userId, appVersion) as Record<string, string>
  };
  headersArray.push(authenticationHeaders);
  const cacheHeaders: Record<string, any> = createCacheHeaders();
  headersArray.push(cacheHeaders);
  const contentHeaders: Record<string, any> = createContentHeaders();
  headersArray.push(contentHeaders);
  const requestHeaders: Record<string, any> = createRequestHeaders(authToken);
  headersArray.push(requestHeaders);
}

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


export const addSnapshot = async (newSnapshot: Omit<Snapshot<Data>, "id">) => {
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
}


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
  snapshots: Snapshot<Data>[],
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

export const fetchSnapshotById = (snapshotId: string): Promise<Snapshot<Data>> => {
  return new Promise(async (resolve, reject) => {
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

      const response = await axiosInstance.get<Snapshot<Data>>(
        `${API_BASE_URL}/${snapshotId}`,
        {
          headers: headers as Record<string, string>,
        }
      );

      resolve(response.data);
    } catch (error) {
      const errorMessage = "Failed to fetch snapshot by ID";
      handleApiError(error as AxiosError<unknown>, errorMessage);
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

export const takeSnapshot = async (
  target: SnapshotList | Content,
  date?: Date,
  projectType?: ProjectType,
  projectId?: string,
  projectState?: ProjectStateEnum,
  projectPriority?: PriorityTypeEnum,
  projectMembers?: Member[]
) => {
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
      return response.data;
    }
  } catch (error: any) {
    handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
    throw error; 
  }
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



export const getSnapshotId = async (snapshot: Snapshot<Data>): Promise<number> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;
    const authenticationHeaders: AuthenticationHeaders = createAuthenticationHeaders(accessToken, userId, currentAppVersion);
    const headersArray = [
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];
    const headers = Object.assign({}, ...headersArray);

    // Make an API call to fetch the snapshot ID based on the provided snapshot
    const response = await axiosInstance.get<number>('/api/snapshotId', {
      headers,
      params: { snapshotData: snapshot.data },
    });

    return response.data; // Assuming the response contains the snapshot ID
  } catch (error) {
    const errorMessage = "Failed to get snapshot id";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};