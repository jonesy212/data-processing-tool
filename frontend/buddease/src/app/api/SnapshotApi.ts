import { AxiosError } from "axios";
import useErrorHandling from "../components/hooks/useErrorHandling";
import determineFileCategory from "../components/libraries/categories/determineFileCategory";
import { processSnapshotsByCategory } from "../components/libraries/categories/fileCategoryMapping";
import { Category } from "../components/libraries/categories/generateCategoryProperties";
import { Content } from "../components/models/content/AddContent";
import { BaseData, Data } from "../components/models/data/Data";
import {
  PriorityTypeEnum,
  ProjectStateEnum
} from "../components/models/data/StatusType";
import { Member } from "../components/models/teams/TeamMembers";
import { ProjectType } from "../components/projects/Project";
import { SnapshotConfig, SnapshotStoreConfig, SnapshotWithCriteria } from "../components/snapshots";
import {
  Snapshot,
  Snapshots
} from "../components/snapshots/LocalStorageSnapshotStore";
import { SnapshotContainer } from "../components/snapshots/SnapshotContainer";
import SnapshotList from "../components/snapshots/SnapshotList";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { isValidFileCategory } from "../components/snapshots/isValidFileCategory";
import { FilterState } from "../components/state/redux/slices/FilterSlice";
import {
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import { AppConfig, getAppConfig } from "../configs/AppConfig";
import configData from "../configs/configData";
import { CategoryProperties } from "../pages/personas/ScenarioBuilder";
import { CriteriaType } from "../pages/searchs/CriteriaType";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import { constructTarget, Target } from "./EndpointConstructor";
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
const dispatch = useDispatch()
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

interface SnapshotStoreIdResponse {
  storeId: number;
}

const handleSnapshotApiError = (
  error: AxiosError<unknown>,
  customMessage: string
) => {
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
 

const createHeaders = (additionalHeaders?: Record<string, string>) => {
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
    additionalHeaders || {},
  ];

  return Object.assign({}, ...headersArray);
};


// API call function
const apiCall = async <T extends Data, K extends Data>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K>> => {
  try {
    const headers = createHeaders(additionalHeaders);
    const response = await axiosInstance({
      url,
      method,
      headers: headers as Record<string, string>,
      data
    });

    if (response.status === 200) {
      return response.data as Snapshot<T, K>;
    } else {
      handleOtherStatusCodes(getAppConfig(), response.status);
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, `Failed to ${method.toLowerCase()} data`);
    throw error;
  }
};

const getSnapshot = <T extends Data, K extends Data>(
  snapshotId: string | number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K> | undefined> => {
  return apiCall<Data>(
    `${API_BASE_URL}/snapshot/${snapshotId}`,
    'GET',
    undefined,
    additionalHeaders
  )
    .then((response) => response as Snapshot<T, K>) // Assert the response type
    .catch((error) => {
      console.error('Failed to fetch snapshot:', error);
      return undefined; // Handle errors gracefully by returning undefined
    });
};


// Get snapshot data with proper type handling
function getSnapshotData<T extends Data, K extends Data>(
  snapshotId: string | number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K> | undefined> {
  return apiCall<Data>(
    `${API_BASE_URL}/snapshot/${snapshotId}`,
    'GET',
    undefined,
    additionalHeaders
  )
    .then((response) => {
      if (response) {
        let categoryName: string | undefined;

        if (typeof response.data === 'string') {
          categoryName = response.data;
        } else if (response.data instanceof Map) {
          categoryName = Array.from(response.data.keys())[0]; 
        } else if (response.data && typeof response.data === 'object') {
          categoryName = (response.data as any).category; 
        }

        if (categoryName) {
          const category = determineFileCategory(categoryName);
          const isValid = isValidFileCategory(category);

          if (!isValid) {
            console.warn('Invalid file category detected for snapshot:', snapshotId);
            return undefined;
          }

          // Process the snapshot data by category (if relevant)
          const processedSnapshot = processSnapshotsByCategory(response, category);

          return processedSnapshot; // Ensure the type matches Snapshot<T, K>
        }
      }

      return undefined;
    })
    .catch((error) => {
      console.error('Error fetching snapshot data:', error);
      return undefined;
    });
}
// // Get snapshot data
// async function getSnapshotData<T extends Data, K extends Data>(
//   snapshotId: string | number,
//   additionalHeaders?: Record<string, string>
// ): Promise<Snapshot<T, K> | undefined> {
//   try {
//     // Step 1: Make the API call to fetch snapshot data
//     const response = await apiCall<Snapshot<T, K>>(
//       `${API_BASE_URL}/snapshot/${snapshotId}`,
//       'GET',
//       undefined,
//       additionalHeaders
//     );

//     // Step 2: Validate the snapshot data if needed
//     if (response) {
//       if (isValidFileCategory( category)) {
//         const data = await fetchFileSnapshotData(FileCategory[category], String(snapshotId));
//       }
//       // Example: Use determineFileCategory and isValidFileCategory if applicable
//       const category = determineFileCategory(response.data);
//       const isValid = isValidFileCategory(category);

//       if (!isValid) {
//         console.warn('Invalid file category detected for snapshot:', snapshotId);
//         return undefined;
//       }

//       // Step 3: Process the snapshot data by category (if relevant)
//       const processedSnapshot = processSnapshotsByCategory(response, category);

//       // Step 4: Return the processed snapshot data
//       return processedSnapshot;
//     }

//     // Handle the case where the response is undefined
//     return undefined;
//   } catch (error) {
//     console.error('Error fetching snapshot data:', error);
//     return undefined; // Return undefined in case of errors
//   }
// }


const findSubscriberById = async (
  subscriberId: string,
  category: symbol | string | Category | undefined,
  endpointCategory: string | number
): Promise<Member> => {
  const target: Target = constructTarget(
    endpointCategory,
    `${endpoints.members.list}?subscriberId=${subscriberId}`
  );
  const headers: Record<string, any> = createRequestHeaders(String(target.url));

  if (!target.url) {
    throw new Error("Target URL is undefined");
  }

  const response = await axiosInstance.get(target.url, {
    headers: headers as Record<string, string>,
  });
  return response.data;
};

// Create snapshot
const createSnapshot = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>
): Promise<void> => {
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
    const response = await axiosInstance.post("/snapshots", snapshot, {
      headers: headers as Record<string, string>,
    });

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
    switch (statusCode) {
      case 400:
        console.log(
          "Bad Request: The server could not understand the request due to invalid syntax."
        );
        // Add logic for handling 400 Bad Request
        break;
      case 401:
        console.log(
          "Unauthorized: Access is denied due to invalid credentials."
        );
        // Add logic for handling 401 Unauthorized
        break;
      case 403:
        console.log(
          "Forbidden: The server understands the request but refuses to authorize it."
        );
        // Add logic for handling 403 Forbidden
        break;
      case 404:
        console.log(
          "Not Found: The server can not find the requested resource."
        );
        // Add logic for handling 404 Not Found
        break;
      case 429:
        console.log(
          "Too Many Requests: The user has sent too many requests in a given amount of time."
        );
        // Add logic for handling 429 Too Many Requests
        break;
      // Add more specific client error codes as needed
      default:
        console.log(`Client error occurred: ${statusCode}`);
        // Default handling for other 4xx client errors
        break;
    }
  } else if (statusCode >= 500 && statusCode < 600) {
    console.log(`Handling server error status code: ${statusCode}`);
    switch (statusCode) {
      case 500:
        console.log(
          "Internal Server Error: The server has encountered a situation it doesn't know how to handle."
        );
        // Add logic for handling 500 Internal Server Error
        break;
      case 502:
        console.log(
          "Bad Gateway: The server was acting as a gateway or proxy and received an invalid response from the upstream server."
        );
        // Add logic for handling 502 Bad Gateway
        break;
      case 503:
        console.log(
          "Service Unavailable: The server is not ready to handle the request."
        );
        // Add logic for handling 503 Service Unavailable
        break;
      case 504:
        console.log(
          "Gateway Timeout: The server was acting as a gateway or proxy and did not receive a timely response from the upstream server."
        );
        // Add logic for handling 504 Gateway Timeout
        break;
      // Add more specific server error codes as needed
      default:
        console.log(`Server error occurred: ${statusCode}`);
        // Default handling for other 5xx server errors
        break;
    }
  } else {
    console.log(`Unhandled status code: ${statusCode}`);
    // Additional logic for handling other status codes if needed
  }
};

const addSnapshot = async <T extends Data, K extends Data>(
  newSnapshot: Omit<Snapshot<T, K>, "id">
): Promise<void> => {
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
    const response = await axiosInstance.post("/snapshots", newSnapshot, {
      headers: headers as Record<string, string>,
    });

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

const addSnapshotSuccess = async <T extends Data, K extends Data>(
  newSnapshot: Omit<Snapshot<T, K>, "id">
) => {
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
  } catch (error) {
    const errorMessage = "Failed to add snapshot";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

const getSnapshots = async (category: string) => {
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
};

const mergeSnapshots = async (
  snapshots: Snapshots<any>,
  category: string
): Promise<void> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
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
      createRequestHeaders(accessToken || ""),
      // Add other header objects as needed
    ];

    const headers = Object.assign({}, ...headersArray);

    const payload = {
      snapshots,
      category,
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/merge`,
      payload,
      {
        headers: headers as Record<string, string>,
      }
    );

    if (response.status === 200) {
      console.log("Snapshots merged successfully:", response.data);
      // Handle successful merge if needed
    } else {
      console.error("Failed to merge snapshots. Status:", response.status);
      // Handle error cases
    }
  } catch (error) {
    const errorMessage = "Failed to merge snapshots";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

// Fetch snapshot by ID
const fetchSnapshotById = <T extends Data, K extends Data>(
  snapshotId: string
): Promise<SnapshotContainer<T, K> | undefined> => {
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
      const response = await axiosInstance.get(`/snapshots/${snapshotId}`, {
        headers: headers as Record<string, string>,
      });

      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(new Error("Failed to fetch snapshot by ID"));
      }
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch snapshot by ID"
      );
      reject(error);
    }
  });
};

const fetchSnapshotIds = async (category: string): Promise<string[]> => {
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
      `${API_BASE_URL}/snapshots?category=${category}`,
      {
        headers: headers as Record<string, string>,
      }
    );

    if (response.status === 200) {
      const snapshotIds: string[] = response.data.map(
        (snapshot: Snapshot<any, any>) => snapshot.id
      );
      return snapshotIds;
    } else {
      console.error("Failed to fetch snapshot IDs");
      handleOtherStatusCodes(appConfig, response.status);
      return [];
    }
  } catch (error) {
    handleApiError(
      error as AxiosError<unknown>,
      "Failed to fetch snapshot IDs"
    );
    throw error;
  }
};

const fetchAllSnapshots = async <T extends Data, K extends Data>(
  target: SnapshotList<T, K>
): Promise<SnapshotList<T, K>> => {
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
    const response = await axiosInstance.get<SnapshotList<T, K>>(
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

const fetchSnapshotStoreData = async  <T extends Data, K extends Data>(
  snapshotId: string
): Promise<SnapshotStore<T, BaseData>> => {
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

    const response = await axiosInstance.get<SnapshotStore<T, Data>>(
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

const takeSnapshot = <T extends Data, K extends Data>(
  target: SnapshotList<T, K> | Content<T>,
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
      const authenticationHeaders = createAuthenticationHeaders(
        accessToken,
        userId,
        currentAppVersion
      );
      const headersArray = [
        authenticationHeaders,
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(accessToken || ""),
        // Add other header objects as needed
      ];
      const headers = Object.assign({}, ...headersArray);

      let url = "";
      let data: any = {};

      if ("projectType" in target) {
        url = `${API_BASE_URL}/snapshotListEndpoint`;
        data = {
          date,
          projectType,
          projectId,
          projectState,
          projectPriority,
          projectMembers,
        };
      } else if ("title" in target) {
        url = `${API_BASE_URL}/contentEndpoint`; // Replace with your actual endpoint
        data = {
          content: target,
        };
      } else {
        throw new Error("Invalid target");
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
  });
};

const saveSnapshotToDatabase = async (snapshotData: any): Promise<boolean> => {
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
    handleSnapshotApiError(
      error as AxiosError<unknown>,
      "Failed to save snapshot to database"
    );
    // Return false to indicate failure
    return false;
  }
};

// Update the getSortedList function to accept the Target type
const getSortedList = async <T extends Data, K extends Data>(
  target: Target
): Promise<SnapshotList<T, K>> => {
  try {
    // Destructure the target object to extract the endpoint and params
    const { endpoint, params } = target;

    // Construct the target URL using the endpoint and params
    const constructedTarget = constructTarget("apiWebBase", endpoint, params);

    // Fetch snapshots using the constructed target
    const snapshotsList = await fetchAllSnapshots<T, K>(
      constructedTarget.toArray()
    );

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

const removeSnapshot = async (snapshotId: number | null): Promise<void> => {
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
const getSnapshotId = <T, K>(criteria: any): Promise<number | undefined> => {
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
      });

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

const snapshotContainer =  <T extends Data, K extends Data>(
  snapshotId: string
): Promise<SnapshotContainer<T, K>> => {
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
      const response = await axiosInstance.get<SnapshotContainer<T, K>>(
        `${API_BASE_URL}/${snapshotId}/container`,
        {
          headers: headers as Record<string, string>,
        }
      );
      resolve(response.data);
    } catch (error) {
      const errorMessage = "Failed to get snapshot container";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  })
};

function extractCriteria<T extends Data>(
  snapshot: Snapshot<T, any> | undefined,
  properties: Array<keyof FilterState>
): Partial<FilterState> {
  return properties.reduce((criteria, prop) => {
    if (snapshot && prop in snapshot) {
      (criteria as any)[prop] = (snapshot as any)[prop];
    }
    return criteria;
  }, {} as Partial<FilterState>);
}


const getSnapshotCriteria = async <T extends Data, K extends Data>(
  snapshotContainer: SnapshotContainer<T, K>,
  snapshot?: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: Snapshot<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<Snapshot<T, K>>,
  snapshotObj?: Snapshot<T, K> | undefined,
): Promise<CriteriaType> => {
  try {
    // Define the properties you want to extract
    const criteriaProperties: Array<keyof FilterState> = [
      "startDate",
      "endDate",
      "status",
      "priority",
      "assignedUser",
      "notificationType",
      "todoStatus",
      "taskStatus",
      "teamStatus",
      "dataStatus",
      "calendarStatus",
      "notificationStatus",
      "bookmarkStatus",
      "priorityType",
      "projectPhase",
      "developmentPhase",
      "subscriberType",
      "subscriptionType",
      "analysisType",
      "documentType",
      "fileType",
      "tenantType",
      "ideaCreationPhaseType",
      "securityFeatureType",
      "feedbackPhaseType",
      "contentManagementType",
      "taskPhaseType",
      "animationType",
      "languageType",
      "codingLanguageType",
      "formatType",
      "privacySettingsType",
      "messageType",
    ];

    // Extract criteria from the snapshot
    const criteria = extractCriteria(snapshotObj, criteriaProperties);

    // Cast to CriteriaType if necessary
    return criteria as CriteriaType;
  } catch (error) {
    const errorMessage = "Failed to get snapshot criteria";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

const getSnapshotStoreId = async (
  snapshotId: number | null
): Promise<number> => {
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
    ];
    // Add other header objects as needed
    const headers = Object.assign({}, ...headersArray);
    const response = await axiosInstance.get<SnapshotStoreIdResponse>(
      `${API_BASE_URL}/${snapshotId}/storeId`,
      {
        headers: headers as Record<string, string>,
      }
    );
    return response.data.storeId;
  } catch (error) {
    const errorMessage = "Failed to get snapshot store ID";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};




const getSnapshotConfig = <T extends Data, K extends Data>(
  snapshotId: number | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties,
  delegate: any,
  snapshot: (
    id: string,
    snapshotId: number | null,
    snapshotData: Snapshot<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshotStore: Snapshot<T, K>) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<Snapshot<T, K>>,
): Promise<SnapshotConfig<T, K>> => {
  return new Promise<SnapshotConfig<T, K>>((resolve, reject) => {
    const fetchSnapshotConfig = async () => {
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
        ];

        const headers = Object.assign({}, ...headersArray);

        // Perform the API request
        const response = await axiosInstance.post<SnapshotConfig<T, K>>(
          `${API_BASE_URL}/${snapshotId}/config`,
          {
            snapshotContainer,
            criteria,
            category,
            categoryProperties,
            delegate,
          },
          {
            headers: headers as Record<string, string>,
          }
        );

        const snapshotConfigData = response.data;

        // Handle the snapshot if snapshotId is not null
        if (snapshotId !== null) {
          snapshot(
            `${snapshotId}`,
            snapshotId,
            snapshotContainer.snapshotData,
            category,
            (snapshotStore: Snapshot<T, K>) => {
              // Handle the snapshotStore as needed
              const shouldUpdateState = true; // Replace with actual condition
              const shouldLog = true; // Replace with actual condition
              const shouldUpdateUI = false; // Replace with actual condition
            
              if (shouldUpdateState) {
                // Update the state with the snapshotStore
                dispatch(updateSnapshotStore(snapshotStore));
              }
            
              if (shouldLog) {
                // Log the snapshotStore data
                console.log('Snapshot store updated:', snapshotStore);
                // or send it to an analytics service
                sendToAnalytics('snapshotStoreUpdated', snapshotStore);
              }
            
              if (shouldUpdateUI) {
                // Update the UI with the snapshotStore
                updateUIWithSnapshotStore(snapshotStore);
              }
            },
            undefined,
            snapshotContainer.snapshotStore
          );
        }

        resolve(snapshotConfigData);
      } catch (error) {
        const errorMessage = "Failed to get snapshot config";
        handleApiError(error as AxiosError<unknown>, errorMessage);
        reject(error);
      }
    };

    fetchSnapshotConfig();
  });
}



const getSnapshotStoreConfigData =  <T extends Data, K extends Data>(
  snapshotId: number | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  storeId: number,
  config:  SnapshotStoreConfig<SnapshotWithCriteria<Data, any>, any>
): Promise<SnapshotConfig<T, K>> => {
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
      ];
      const headers = Object.assign({}, ...headersArray);
      const response = await axiosInstance.post<SnapshotConfig<T, K>>(
        `${API_BASE_URL}/${snapshotId}/config`,
        {
          snapshotContainer,
          criteria,
        },
        {
          headers: headers as Record<string, string>,
        }
      );
      resolve(response.data);
    } catch (error) {
      const errorMessage = "Failed to get snapshot config";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  })
};

const getSnapshotStoreConfig = <T extends Data, K extends Data>(
  snapshotId: number | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  storeId: number
): Promise<SnapshotStoreConfig<T, K>> => {
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
      ];
      const headers = Object.assign({}, ...headersArray);
      const response = await axiosInstance.post<SnapshotStoreConfig<T, K>>(
        `${API_BASE_URL}/${snapshotId}/config/${storeId}`,
        {
          snapshotContainer,
          criteria,
        },
        {
          headers: headers as Record<string, string>,
        }
      );
      resolve(response.data);
    } catch (error) {
      const errorMessage = "Failed to get snapshot config";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  });
}

const getSnapshotStore = <T extends Data, K extends Data>(
  storeId: number,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType
): Promise<SnapshotStore<T, K>> => {
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
      ];
      const headers = Object.assign({}, ...headersArray);
      const response = await axiosInstance.post<SnapshotStore<T, K>>(
        `${API_BASE_URL}/${storeId}/store`,
        {
          snapshotContainer,
          criteria,
        },
        {
          headers: headers as Record<string, string>,
        }
      );
    } catch (error) {
      const errorMessage = "Failed to get snapshot store";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);  
    }
  })
}


export {
  addSnapshot,
  addSnapshotSuccess, createSnapshot, fetchAllSnapshots, fetchSnapshotById,
  fetchSnapshotIds, fetchSnapshotStoreData, findSubscriberById, getSnapshot, getSnapshotConfig, getSnapshotCriteria, getSnapshotData, getSnapshotId, getSnapshots, getSnapshotStore, getSnapshotStoreConfig, getSnapshotStoreConfigData, getSnapshotStoreId, getSortedList,
  handleOtherApplicationLogic, handleOtherStatusCodes, handleSpecificStatusCode,
  mergeSnapshots, removeSnapshot, saveSnapshotToDatabase, snapshotContainer,
  takeSnapshot, apiCall
};

