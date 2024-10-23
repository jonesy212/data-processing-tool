import * as snapshotApi from '@/app/api/SnapshotApi';
import { AxiosError } from "axios";
import { useDispatch } from 'react-redux';
import { subscriptionService } from '../components/hooks/dynamicHooks/dynamicHooks';
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
import { RealtimeDataItem } from '../components/models/realtime/RealtimeData';
import { Member } from "../components/models/teams/TeamMembers";
import { DataStoreMethods } from '../components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { sendToAnalytics } from '../components/projects/DataAnalysisPhase/sendToAnalytics';
import { ProjectType } from "../components/projects/Project";
import { ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotData, SnapshotDataType, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria, useSnapshotStore } from "../components/snapshots";
import {
  Snapshot,
  Snapshots
} from "../components/snapshots/LocalStorageSnapshotStore";
import { SnapshotConfigProps } from '../components/snapshots/SnapshotConfigProps';
import { SnapshotContainer, SnapshotContainerData } from "../components/snapshots/SnapshotContainer";
import SnapshotList from "../components/snapshots/SnapshotList";
import { isSnapshotFunction } from '../components/snapshots/SnapshotMap';
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { isSnapshot } from '../components/snapshots/createSnapshotStoreOptions';
import { isValidFileCategory } from "../components/snapshots/isValidFileCategory";
import { updateUIWithSnapshotStore } from '../components/snapshots/updateUIWithSnapshotStore';
import { FilterState } from "../components/state/redux/slices/FilterSlice";
import CalendarManagerStoreClass from '../components/state/stores/CalendarEvent';
import { Subscription } from '../components/subscriptions/Subscription';
import {
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import { Subscriber } from '../components/users/Subscriber';
import { addToSnapshotList } from "../components/utils/snapshotUtils";
import useSecureStoreId from '../components/utils/useSecureStoreId';
import { AppConfig, getAppConfig } from "../configs/AppConfig";
import configData from "../configs/configData";
import { UnifiedMetaDataOptions } from '../configs/database/MetaDataOptions';
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
const apiCall = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, Meta, K>> => {
  return new Promise<Snapshot<T, Meta, K>>(async (resolve, reject) => {
    try {
      const headers = createHeaders(additionalHeaders);
      const response = await axiosInstance({
        url,
        method,
        headers: headers as Record<string, string>,
        data
      });

      if (response.status === 200) {
        resolve(response.data as Snapshot<T, Meta, K>);
      } else {
        handleOtherStatusCodes(getAppConfig(), response.status);
        reject(new Error(`Unexpected status code: ${response.status}`));
      }
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to ${method.toLowerCase()} data`);
      reject(error);
    }
  });
};

function getSnapshotData<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | number,
  additionalHeaders?: Record<string, string>
): Promise<SnapshotDataType<T, Meta, K> | undefined> {
  return apiCall<T, Meta, K>(
    `${API_BASE_URL}/snapshot/${snapshotId}`,
    'GET',
    undefined,
    additionalHeaders
  )
    .then((response) => {
      if (response) {
        let categoryName: string | undefined;

        // Determine categoryName from the response data
        if (typeof response.data === 'string') {
          categoryName = response.data;
        } else if (response.data instanceof Map) {
          categoryName = Array.from(response.data.keys())[0]; // Use the first key as the category
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

          // Ensure processedSnapshot conforms to Snapshot<T, Meta, K>
          if (isSnapshot(processedSnapshot)) { // Create this type guard function to check if processedSnapshot is of type Snapshot<T, Meta, K>
            return processedSnapshot
          } else {
            console.warn('Processed snapshot is not a valid Snapshot<T, Meta, K>', processedSnapshot);
            return undefined;
          }
        }
      }
      return undefined;
    })
    .catch((error) => {
      console.error('Error fetching snapshot data:', error);
      return undefined;
    }) as Promise<Snapshot<T, Meta, K> | undefined>
}


const getSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | number,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, Meta, K>> => {
  return new Promise((resolve, reject) => {
    // synchronous logic here
    const snapshot: Snapshot<T, Meta, K> = {/* logic to fetch snapshot */ } as Snapshot<T, Meta, K>;
    if (snapshot) {
      resolve(snapshot);
    } else {
      reject('Snapshot not found');
    }
  });
};




const findSubscriberById = async   <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  subscriberId: string,
  category: symbol | string | Category | undefined,
  endpointCategory: string | number
): Promise<Subscriber<T, Meta, K>> => {
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
const createSnapshot = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>
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



const findSnapshotsBySubscriber = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  subscriberId: string,
  category: symbol | string | Category | undefined,
  endpointCategory: string | number,
  snapshotConfig: SnapshotConfig<T, Meta, K>
): Promise<Snapshot<T, Meta, K>[]> => {
  const target: Target = constructTarget(
    endpointCategory,
    `${endpoints.snapshots.list}?subscriberId=${subscriberId}&category=${String(category)}`
  );

  const headers: Record<string, any> = createRequestHeaders(String(target.url));

  if (!target.url) {
    throw new Error("Target URL is undefined");
  }

  try {
    const response = await axiosInstance.get(target.url, { headers });
    const snapshotsData: SnapshotDataType<T, Meta, K>[] = response.data;

    const mapSnapshotEntryToSnapshot = (entry: any): Snapshot<T, Meta, K> | null => {
      if (!entry || typeof entry !== 'object') return null;

      // Check if snapshotData is a Map
      if (snapshotData instanceof Map) {
        // If it's a Map, handle the map entries
        return Array.from(snapshotData.values()).map((entry) => ({

          id: entry.id,
          data: entry.data,
          metadata: entry.metadata,
          initialState: entry.data as T,  // Provide default value or mapping
          isCore: true,  // Set default value if it's not available
          initialConfig: entry.initialConfig,

          isSubscribed: entry.isSubscribed, 
          clearSnapshotSuccess: entry.clearSnapshotSuccess, 
          addToSnapshotList: entry.addToSnapshotList, 
          getSnapshotsBySubscriberSuccess: entry.getSnapshotsBySubscriberSuccess, 
          isExpired: entry.isExpired,




          criteria: entry.criteria,
          snapshotContainer: entry.snapshotContainer,
          snapshotCategory: entry.snapshotCategory,
          snapshotSubscriberId: entry.snapshotSubscriberId,

          initializeWithData: entry.initializeWithData ? entry.initializeWithData : () => {},
          hasSnapshots: entry.hasSnapshots ?? (() => false), // Default to a function that returns false if undefined
    

          removeSubscriber: entry.removeSubscriber,
          onInitialize: entry.onInitialize,
          onError: entry.onError,
          taskIdToAssign: entry.taskIdToAssign,
          schema: entry.schema,
          currentCategory: entry.currentCategory,
          mappedSnapshotData: entry.mappedSnapshotData,
          // snapshot: entry.snapshot,
          setCategory: entry.setCategory,
          applyStoreConfig: entry.applyStoreConfig,
          generateId: entry.generateId,
          snapshotData: entry.snapshotData,
          getSnapshotItems: entry.getSnapshotItems,
          defaultSubscribeToSnapshots: entry.defaultSubscribeToSnapshots,
          getSnapshotsBySubscriber: entry.getSnapshotsBySubscriber,

          notify: entry.notify,
          notifySubscribers: entry.notifySubscribers,
          getAllSnapshots: entry.getAllSnapshots,
          getSubscribers: entry.getSubscribers,
          versionInfo: entry.versionInfo,
          transformSubscriber: entry.transformSubscriber,
          transformDelegate: entry.transformDelegate,
          initializedState: entry.initializedState,
          getAllKeys: entry.getAllKeys,
          getAllValues: entry.getAllValues,
          getAllItems: entry.getAllItems,
          getSnapshotEntries: entry.getSnapshotEntries,
          getAllSnapshotEntries: entry.getAllSnapshotEntries,
          addDataStatus: entry.addDataStatus,
          removeData: entry.removeData,
          updateData: entry.updateData,
          storeId: entry.storeId,
          snapConfig: entry.snapConfig,

          updateDataTitle: entry.updateDataTitle,
          updateDataDescription: entry.updateDataDescription,
          updateDataStatus: entry.updateDataStatus,

          addDataSuccess: entry.addDataSuccess,
          getDataVersions: entry.getDataVersions,
          updateDataVersions: entry.updateDataVersions,
          getBackendVersion: entry.getBackendVersion,
          getFrontendVersion: entry.getFrontendVersion,
          fetchData: entry.fetchData,
          defaultSubscribeToSnapshot: entry.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: entry.handleSubscribeToSnapshot,


          removeItem: entry.removeItem,
          getSnapshot: entry.getSnapshot,
          getSnapshotSuccess: entry.getSnapshotSuccess,
          setItem: entry.setItem,
          getItem: entry.getItem,
          getDataStore: entry.getDataStore,
          getDataStoreMap: entry.getDataStoreMap,
          addSnapshotSuccess: entry.addSnapshotSuccess,
          deepCompare: entry.deepCompare,
          shallowCompare: entry.shallowCompare,
          getDataStoreMethods: entry.getDataStoreMethods,
          getDelegate: entry.getDelegate,
          determineCategory: entry.determineCategory,
          determinePrefix: entry.determinePrefix,
          removeSnapshot: entry.removeSnapshot,
          addSnapshotItem: entry.addSnapshotItem,
          addNestedStore: entry.addNestedStore,
          clearSnapshots: entry.clearSnapshots,
          addSnapshot: entry.addSnapshot,

          emit: entry.emit,
          snapshot: entry.snapshot,



          updateSnapshots: entry.updateSnapshots ?? (() => null),
          takeSnapshot: entry.takeSnapshot ?? (() => null),
          validateSnapshot: entry.validateSnapshot ?? (() => false),
          handleActions: entry.handleActions ?? (() => null),
          setSnapshot: entry.setSnapshot ?? (() => null),
          clearSnapshot: entry.clearSnapshot ?? (() => null),
          mergeSnapshots: entry.mergeSnapshots ?? (() => null),
          
          createSnapshot: entry.createSnapshot ?? (() => null),
          createInitSnapshot: entry.createInitSnapshot ?? (() => null),
          addStoreConfig: entry.addStoreConfig,
          handleSnapshotConfig: entry.handleSnapshotConfig,
          getSnapshotConfig: entry.getSnapshotConfig,
          getSnapshotListByCriteria: entry.getSnapshotListByCriteria,
          setSnapshotSuccess: entry.setSnapshotSuccess,
          setSnapshotFailure: entry.setSnapshotFailure,
          updateSnapshotsSuccess: entry.updateSnapshotsSuccess,
          updateSnapshotsFailure: entry.updateSnapshotsFailure,
          initSnapshot: entry.initSnapshot,
          takeSnapshotSuccess: entry.takeSnapshotSuccess,
          takeSnapshotsSuccess: entry.takeSnapshotsSuccess,
          flatMap: entry.flatMap,
          getState: entry.getState,
          setState: entry.setState,
          
          transformSnapshotConfig: entry.transformSnapshotConfig,
          setSnapshots: entry.setSnapshots,
          
          reduceSnapshots: entry.reduceSnapshots,
          sortSnapshots: entry.sortSnapshots,
          filterSnapshots: entry.filterSnapshots,
          equals: entry.equals,
          findSnapshot: entry.findSnapshot,
          mapSnapshots: entry.mapSnapshots,
          takeLatestSnapshot: entry.takeLatestSnapshot,
          updateSnapshot: entry.updateSnapshot,
          addSnapshotSubscriber: entry.addSnapshotSubscriber,
          removeSnapshotSubscriber: entry.removeSnapshotSubscriber,
          getSnapshotConfigItems: entry.getSnapshotConfigItems,
          subscribeToSnapshots: entry.subscribeToSnapshots,
          executeSnapshotAction: entry.executeSnapshotAction,
          subscribeToSnapshot: entry.subscribeToSnapshot,
          unsubscribeFromSnapshot: entry.unsubscribeFromSnapshot,
          subscribeToSnapshotsSuccess: entry.subscribeToSnapshotsSuccess,
          unsubscribeFromSnapshots: entry.unsubscribeFromSnapshots,
          getSnapshotItemsSuccess: entry.getSnapshotItemsSuccess,
          getSnapshotItemSuccess: entry.getSnapshotItemSuccess,
          getSnapshotKeys: entry.getSnapshotKeys,
          getSnapshotIdSuccess: entry.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: entry.getSnapshotValuesSuccess,
          getSnapshotWithCriteria: entry.getSnapshotWithCriteria,
          reduceSnapshotItems: entry.reduceSnapshotItems,
          subscribeToSnapshotList: entry.subscribeToSnapshotList,
          config: entry.config,
          timestamp: entry.timestamp,
          label: entry.label,
          events: entry.events,
          restoreSnapshot: entry.restoreSnapshot,
          handleSnapshot: entry.handleSnapshot,
          subscribe: entry.subscribe,
          meta: entry.meta,
          items: entry.items,
          subscribers: entry.subscribers,

          snapshotStore: entry.snapshotStore,
          setSnapshotCategory: entry.setSnapshotCategory,
          getSnapshotCategory: entry.getSnapshotCategory,
          getSnapshotData: entry.getSnapshotData,
          deleteSnapshot: entry.deleteSnapshot,
          getSnapshots: entry.getSnapshots,
          compareSnapshots: entry.compareSnapshots,
          compareSnapshotItems: entry.compareSnapshotItems,
          batchTakeSnapshot: entry.batchTakeSnapshot,
          batchFetchSnapshots: entry.batchFetchSnapshots,
          batchTakeSnapshotsRequest: entry.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: entry.batchUpdateSnapshotsRequest,
          filterSnapshotsByStatus: entry.filterSnapshotsByStatus,
          filterSnapshotsByCategory: entry.filterSnapshotsByCategory,
          filterSnapshotsByTag: entry.filterSnapshotsByTag,
          batchFetchSnapshotsSuccess: entry.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: entry.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: entry.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: entry.batchUpdateSnapshotsFailure,


          handleSnapshotSuccess: entry.handleSnapshotSuccess,
          handleSnapshotFailure: entry.handleSnapshotFailure,
          getSnapshotId: entry.getSnapshotId,
          compareSnapshotState: entry.compareSnapshotState,
          payload: entry.payload,
          dataItems: entry.dataItems,
          newData: entry.newData,
          getInitialState: entry.getInitialState,
          getConfigOption: entry.getConfigOption,
          getTimestamp: entry.getTimestamp,
          getStores: entry.getStores,
          getData: entry.getData,
          setData: entry.setData,
          addData: entry.addData,
          stores: entry.stores,
          getStore: entry.getStore,
          addStore: entry.addStore,
          mapSnapshot: entry.mapSnapshot,
          mapSnapshotWithDetails: entry.mapSnapshotWithDetails,
          removeStore: entry.removeStore,
          unsubscribe: entry.unsubscribe,
          fetchSnapshot: entry.fetchSnapshot,
          fetchStoreData: entry.fetchStoreData,
          snapshotMethods: entry.snapshotMethods,

          fetchSnapshotSuccess: entry.fetchSnapshotSuccess,
          updateSnapshotFailure: entry.updateSnapshotFailure,
          fetchSnapshotFailure: entry.fetchSnapshotFailure,
          addSnapshotFailure: entry.addSnapshotFailure,
          configureSnapshotStore: entry.configureSnapshotStore,
          updateSnapshotSuccess: entry.updateSnapshotSuccess,
          createSnapshotFailure: entry.createSnapshotFailure,
          createSnapshotSuccess: entry.createSnapshotSuccess,
          createSnapshots: entry.createSnapshots,
          onSnapshot: entry.onSnapshot,
          onSnapshots: entry.onSnapshots,
          childIds: entry.childIds,
          getParentId: entry.getParentId,
          getChildIds: entry.getChildIds,
          addChild: entry.addChild,
          removeChild: entry.removeChild,
          getChildren: entry.getChildren,
          hasChildren: entry.hasChildren,
          isDescendantOf: entry.isDescendantOf,
          getSnapshotById: entry.getSnapshotById,
        }));
      }

      const snapshots: Snapshot<T, Meta, K>[] = snapshotsData.flatMap((snapshotData) => {
        if (!snapshotData) return [];
  
        if (snapshotData instanceof Map) {
          return Array.from(snapshotData.values())
            .map(mapSnapshotEntryToSnapshot)
            .filter(Boolean) as Snapshot<T, Meta, K>[];
        }
  
        return mapSnapshotEntryToSnapshot(snapshotData) ? [mapSnapshotEntryToSnapshot(snapshotData)!] : [];
      });
    

      return snapshots;
     }
    } catch (error) {
     throw new Error(`Failed to fetch snapshots: ${(error as Error).message}`);
   }
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

const addSnapshot = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  newSnapshot: Omit<Snapshot<T, Meta, K>, "id">
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

const addSnapshotSuccess = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  newSnapshot: Omit<Snapshot<T, Meta, K>, "id">
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
  snapshots: Snapshots<any, any>,
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
const fetchSnapshotById = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string
): Promise<SnapshotContainer<T, Meta, K> | undefined> => {
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

const fetchAllSnapshots = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  target: SnapshotList<T, Meta, K>
): Promise<SnapshotList<T, Meta, K>> => {
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
    const response = await axiosInstance.get<SnapshotList<T, Meta, K>>(
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

const fetchSnapshotStoreData = async  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string
): Promise<SnapshotStore<T, Meta, BaseData>> => {
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

    const response = await axiosInstance.get<SnapshotStore<T, Meta, Data>>(
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

const takeSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  target: SnapshotList<T, Meta, K> | Content<T, Meta, K>,
  date?: Date,
  projectType?: ProjectType,
  projectId?: string,
  projectState?: ProjectStateEnum,
  projectPriority?: PriorityTypeEnum,
  projectMembers?: Member[]
): Promise<Snapshot<T, Meta, Data>> => {
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
const getSortedList = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  target: Target
): Promise<SnapshotList<T, Meta, K>> => {
  try {
    // Destructure the target object to extract the endpoint and params
    const { endpoint, params } = target;

    // Construct the target URL using the endpoint and params
    const constructedTarget = constructTarget("apiWebBase", endpoint, params);

    // Fetch snapshots using the constructed target
    const snapshotsList = await fetchAllSnapshots<T, Meta, K>(
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

const removeSnapshot = async (snapshotId: string | null): Promise<void> => {
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
const getSnapshotId = <T, Meta, K>(criteria: any): Promise<number | undefined> => {
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

const snapshotContainer = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string
): Promise<SnapshotContainer<T, Meta, K>> => {
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
      const response = await axiosInstance.get<SnapshotContainer<T, Meta, K>>(
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

function getCurrentSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, Meta, K> | null> {
  return new Promise((resolve, reject) => {
    snapshotApi.getSnapshot<T, Meta, K>(snapshotId, storeId, additionalHeaders)
      .then(snapshot => {
        if (snapshot) {
          resolve(snapshot);
        } else {
          console.error("Snapshot not found for ID:", snapshotId);
          resolve(null);
        }
      })
      .catch(error => {
        console.error("Error fetching current snapshot:", error);
        reject(error);
      });
  });
}

function getSnapshotContainer<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | number | undefined,
  storeId: number,
  additionalHeaders?: Record<string, string>,
  snapshotConfigProps?: SnapshotConfigProps<T, Meta, K>,
  category?: string | symbol | Category, // Optional category
  snapshotStore?: SnapshotStore<T, Meta, K> // Optional store to retrieve from
): Promise<SnapshotContainer<T, Meta, K>> {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof snapshotId !== 'string') {
        throw new Error('snapshotId must be a string');
      }

      if (!snapshotConfigProps) {
        throw new Error("snapshotConfigProps is required");
      }

      const {
        id,
        criteria,
        category,
        categoryProperties,
        subscriberId,
        delegate,
        snapshot,
        events,
        dataItems,
        newData,
        payload,
        store,
        callback,
        storeProps,
        endpointCategory
      } = snapshotConfigProps

      const data = snapshotApi.getSnapshotData<T, Meta, K>(snapshotId, additionalHeaders)

      if (data instanceof Map && snapshot !== undefined) {
         // Use type guard to ensure the snapshot is of the correct type
        const validatedSnapshot = isSnapshotFunction<T, Meta, K>(snapshot)
        ? snapshot
        : undefined;


  if (validatedSnapshot) {

      const snapshotConfig: Promise<SnapshotConfig<T, Meta, K>> = snapshotApi.getSnapshotConfig<T, Meta, K>(
        id,
        snapshotId,
        criteria,
        category,
        categoryProperties,
        subscriberId,
        delegate,
        validatedSnapshot,
        data,
        events,
        dataItems,
        newData,
        payload,
        store,
        callback,
        storeProps,
        endpointCategory,
      );
        
      const snapshotContainer: SnapshotContainer<T, Meta, K> = {
        ...data,
        ...snapshotConfig,
        getSnapshot: data.getSnapshot,
        find: data.find,
        subscribers: data.subscribers,
       
        content: typeof snapshotConfig.content === 'string' ? snapshotConfig.content :
          (snapshotConfig.content as Content<T>),
        snapshotId:
          typeof snapshotConfig.snapshotId === 'string' ? snapshotConfig.snapshotId : 
          (snapshotConfig.snapshotId as string),
        
        id: data.id,
        data: data.data,
        items: data.items,
        config: data.config,
        timestamp: data.timestamp,
        currentCategory: data.currentCategory,

        mappedSnapshotData: new Map<string, Snapshot<T, Meta, K>>(),
        criteria: {},
        snapshotCategory: undefined,
        snapshotSubscriberId: undefined,
        taskIdToAssign: undefined,
        initialConfig: {},
        removeSubscriber: () => {},
        onInitialize: () => {},
        onError: (error: any) => console.error(error),
        
        initialState: data.snapshotData?.initialState,
        isCore: data.isCore,
        storeId: data.storeId,

        isExpired: data.isExpired,

        updateData: data.updateData,
        removeData: data.removeData,

        getSnapshots: data.getSnapshots,
        getAllSnapshots: data.getAllSnapshots,
        handleSnapshotSuccess: data.handleSnapshotSuccess,
        unsubscribe: data.unsubscribe,
        handleSnapshotFailure: data.handleSnapshotFailure,
        getDataVersions: data.getDataVersions,
        updateDataVersions: data.updateDataVersions,
        createSnapshots: data.createSnapshots,

        snapshotStore: data.snapshotStore || null,
        snapshotData: data.snapshotData,
        snapConfig: data.snapConfig,
        getSnapshotData: data.getSnapshotData,
        deleteSnapshot: data.deleteSnapshot,
        fetchSnapshot: data.fetchSnapshot,
        fetchSnapshotSuccess: data.fetchSnapshotSuccess,
        fetchSnapshotFailure: data.fetchSnapshotFailure,
        createSnapshotSuccess: data.createSnapshotSuccess,
        createSnapshotFailure: data.createSnapshotFailure,
        updateSnapshotSuccess: data.updateSnapshotSuccess,
        updateSnapshotFailure: data.updateSnapshotFailure,
        addSnapshotFailure: data.addSnapshotFailure,
        getSnapshotById: data.getSnapshotById,
        getSnapshotId: data.getSnapshotId,

        batchTakeSnapshot: data.batchTakeSnapshot,
        batchFetchSnapshots: data.batchFetchSnapshots,
        batchTakeSnapshotsRequest: data.batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: data.batchUpdateSnapshotsRequest,
        batchFetchSnapshotsSuccess: data.batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: data.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: data.batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: data.batchUpdateSnapshotsFailure,

        filterSnapshotsByStatus: data.filterSnapshotsByStatus,
        filterSnapshotsByCategory: data.filterSnapshotsByCategory,
        filterSnapshotsByTag: data.filterSnapshotsByTag,

        stores: data.stores,
        getStores: data.getStores,
        getStore: data.getStore,
        addStore: data.addStore,
        removeStore: data.removeStore,
        configureSnapshotStore: data.configureSnapshotStore,

        getData: data.getData,
        setData: data.setData,
        addData: data.addData,
        dataItems: data.dataItems,
        newData: data.newData,

       
        onSnapshot: data.onSnapshot,
        onSnapshots: data.onSnapshots,
        events: data.events,

        childIds: data.childIds,
        getParentId: data.getParentId,
        getChildIds: data.getChildIds,
        addChild: data.addChild,
        removeChild: data.removeChild,
        getChildren: data.getChildren,
        hasChildren: data.hasChildren,
        isDescendantOf: data.isDescendantOf,

        setSnapshotCategory: data.setSnapshotCategory || ((id: string, newCategory: string | Category) => {
          // Implementation for setting the category
        }),

        getSnapshotCategory: data.getSnapshotCategory || ((id: string): Category | undefined => {
          // Implementation for getting the category
          return undefined;
        }),
        compareSnapshots: data.compareSnapshots,
        compareSnapshotItems: data.compareSnapshotItems,
        compareSnapshotState: data.compareSnapshotState,
        payload: data.payload,
        getInitialState: data.getInitialState,
        getConfigOption: data.getConfigOption,
        getTimestamp: data.getTimestamp,
        generateId: data.generateId,

        mapSnapshot: data.mapSnapshot,
        mapSnapshotWithDetails: data.mapSnapshotWithDetails,

        snapshot: data.snapshot || (async (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: SnapshotData<T, Meta, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStore: DataStore<T, Meta, K>,
          dataStoreMethods: DataStoreMethods<T, Meta, K>,
          metadata: UnifiedMetaDataOptions
        ): Promise<{ snapshot: Snapshot<T, Meta, K> }> => {
          return { snapshot: {} as Snapshot<T, Meta, K> };
        }),
      };

      console.log(snapshotContainer.id);
      console.log(snapshotContainer.mappedSnapshotData);
      console.log(snapshotContainer.currentCategory);

        resolve(snapshotContainer);
      } else {
        // Handle the case where validatedSnapshot is not a valid function
        console.error("Invalid snapshot function provided");
        reject(new Error("Invalid snapshot function provided"));
      }
    } else {
      // Handle other possible types, e.g., SnapshotData<T, Meta, K> or undefined
      throw new Error("Unexpected data type returned from getSnapshotData");
    }
  } catch (error: any) {
    console.error("Error retrieving SnapshotContainer:", error);
    reject(error);
  }
  });
}
  
  
  async function fetchSnapshotContainerData<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string,
  storeProps: SnapshotStorePropOptions
): Promise<SnapshotContainerData<T, Meta, K>> {
  // Simulate fetching data, e.g., from an API or database

  const { criteria, storeId} = storeProps
  const 
  const currentConfig = snapshotApi.getSnapshotStoreConfig<T, Meta, K>(snapshotId, snapshotContainer, criteria, storeId)
  
  if(currentConfig === null){
    throw new Error("currentConfig is not properly configurated")
  }
  return {
    id: snapshotId,
    data: {} as T, // Replace with actual data fetching logic
    items: [] as K[], // Replace with actual data fetching logic
    config: currentConfig, // Replace with actual config fetching logic
    timestamp: new Date(),
    currentCategory: "defaultCategory" // Example default value
  };
}






function createSnapshotContainer<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  data: SnapshotContainerData<T, Meta, K>
): SnapshotContainer<T, Meta, K> {
  
  return {

    id: data.id,
    mappedSnapshotData: new Map(), // Initialize as needed
    timestamp: data.timestamp,
    currentCategory: data.currentCategory,
    criteria: {} as CriteriaType, // Set appropriate criteria
    items: [], // Store items related to the snapshot, initialize as an empty array
    config: Promise.resolve({}), // Configuration object for the snapshot, initialize as an empty object
    isExpired: () => false, // Flag to indicate if the snapshot is expired
    subscribers: Array.from(subscribers.keys()), // Return the list of subscriber IDs
    snapshotCategory: {}, // Stores the category of the snapshot
    snapshotSubscriberId: "", // Identifier for the current subscriber
    initialConfig: {} as SnapshotConfig<Data, Meta, Data>,
    
    
    

    setSnapshotCategory: (id: string, newCategory: string | Category) => {
      // Update logic here
    },
    getSnapshotCategory: (id: string) => {
      // Fetch logic here
      return undefined;
    },
    snapshotId: 0, // Replace with the actual snapshot ID
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | number | null,
      snapshotData: SnapshotData<T, Meta, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
      dataStore: DataStore<T, Meta, K>,
      dataStoreMethods: DataStoreMethods<T, Meta, K>,
      metadata: UnifiedMetaDataOptions,
      subscriberId: string,
      endpointCategory: string | number,
      storeProps: SnapshotStoreProps<T, Meta, K>,
      snapshotConfigData: SnapshotConfig<T, Meta, K>,
      subscription: Subscription<T, Meta, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
      snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
    ) => {
      // Logic to return a Snapshot
      return {} as Snapshot<T, Meta, K>; // Placeholder
    },
    snapshotStore: null,
    snapshotData: async (
      id: string | number | undefined,
      snapshotId: number,
      data: Snapshot<T, Meta, K>,
      mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
      snapshotData: SnapshotData<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStoreMethods<T, Meta, K>,
      storeProps: SnapshotStoreProps<T, Meta, K>
    ): Promise<SnapshotDataType<T, Meta, K>> => {
      if (id === undefined || id === null) {
        throw new Error("Invalid id: id cannot be undefined or null.");
      }

      // Fetch the existing snapshot data
      const existingSnapshot = mappedSnapshotData?.get(id);
      if (existingSnapshot) {
        // If an existing snapshot is found, you can merge or update the data as needed
        const updatedData = {
          ...existingSnapshot,
          ...data, // Merge existing snapshot data with new data
        };
        mappedSnapshotData.set(id, updatedData);
      } else {
        // Create a new snapshot if no existing one is found
        mappedSnapshotData?.set(id, data);
      }

      // Perform any additional logic needed to process snapshot data
      const processedSnapshotData = {
        id,
        snapshotId,
        data,
        category,
        categoryProperties,
        // Include additional properties from snapshotData, snapshotStore, etc.
      };

      // Use dataStoreMethods to perform operations on the data store if necessary
      await dataStoreMethods.save(processedSnapshotData);

      // Return the processed snapshot data
      return processedSnapshotData as SnapshotDataType<T, Meta, K>;
    },
    data: data.data,
    snapshotsArray: [], // Replace with actual snapshots array if applicable
    snapshotsObject: {}, // Replace with actual snapshots object if applicable

    removeSubscriber: (subscriberId: string): void => {
      if (subscribers.has(subscriberId)) {
        subscribers.delete(subscriberId); // Remove the subscriber
      } else {
        console.warn(`Subscriber ID ${subscriberId} not found.`);
      }
    },
    onInitialize: (callback: () => void): void => {
      // Trigger callback when the container initializes
      callback();
    },
    onError: (error: Error): void => {
      console.error("An error occurred:", error);
      // Handle error logic (e.g., logging, notifying users)
    },
    
    getSnapshotData: (id: string | number | undefined): SnapshotData<T, Meta, K> | undefined => {
      // Fetch logic to get snapshot data based on ID
      return data.mappedSnapshotData.get(id); // Replace with your data fetching logic
    },
    deleteSnapshot: (id: string): boolean => {
      const deleted = data.mappedSnapshotData.delete(id); // Delete snapshot by ID
      return deleted; // Return true if deletion was successful
    },
    // Additional properties from SnapshotData and SnapshotRelationships, if needed
  };
}




function extractCriteria<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
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

const getSnapshotCriteria = async <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotContainer: SnapshotContainer<T, Meta, K>,
  snapshot?: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, Meta, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: SnapshotStore<T, Meta, K>) => void,
    criteria: CriteriaType,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>,
    snapshotContainerData?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  ) => Promise<SnapshotData<T, Meta, K>>,
  snapshotObj?: Snapshot<T, Meta, K> | undefined,
 
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
  snapshotId: string | null
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

const getSnapshotConfig = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  id: string | number,
  snapshotId: string | null,
  snapshotData: SnapshotData<T, Meta, K, never>,
  criteria: CriteriaType,
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: any,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, Meta, K>, // Type updated here
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, Meta, K> | null) => void,
    dataStore: DataStore<T, Meta, K>,
    dataStoreMethods: DataStoreMethods<T, Meta, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, Meta, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, Meta, K>,
    snapshotConfigData: SnapshotConfig<T, Meta, K>,
    subscription: Subscription<T, Meta, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
    snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
  ) => Promise<{ snapshot: Snapshot<T, Meta, K>; }>,
  data: Map<string, Snapshot<T, Meta, K>>, 
  events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>, // Added prop
  dataItems: RealtimeDataItem[], // Added prop
  newData: Snapshot<T, Meta, K>, // Added prop
  payload: ConfigureSnapshotStorePayload<T, Meta, K>, // Added prop
  store: SnapshotStore<T, Meta, K>, // Added prop
  callback: (snapshot: SnapshotStore<T, Meta, K>) => void, // Added prop
  storeProps: SnapshotStoreProps<T, Meta, K>,
  endpointCategory: string | number,
  snapshotContainer: Promise<SnapshotContainer<T, Meta, K>>,
): Promise<SnapshotConfig<T, Meta, K>> => {
  return new Promise<SnapshotConfig<T, Meta, K>>((resolve, reject) => {
    const subscription = subscriptionService.subscriptions.get("snapshot", {
      id: id,
      snapshotId: snapshotId,
      criteria: criteria,
      category: category,
      // Add any other necessary properties here
    } as SnapshotStoreConfig<T, Meta, K>); // Ensure the correct type casting
    
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
        const storeId = useSecureStoreId()
        // Generate additionalHeaders here
        const additionalHeaders = createHeaders();

        const {snapshotId, snapshotConfigProps, snapshotStore, critria} = storeProps
        if(!snapshotId){
          throw new Error("")
        }
        if(!storeId){
          throw new Error("no store id found")
        }
        const snapshotContainer = await snapshotApi.getSnapshotContainer(snapshotId, Number(storeId), additionalHeaders, snapshotConfigProps, category, snapshotStore)
        const snapshotStoreConfig = await snapshotApi.getSnapshotStoreConfig(snapshotId, snapshotContainer, critria, storeId);

        // Perform the API request
        const response = await axiosInstance.post<SnapshotConfig<T, Meta, K>>(
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
      
        if(!snapshotContainer){
          throw new Error("SnapshotContainer is undefined");
        }

        // Assuming snapshotContainer is a Promise<SnapshotContainer<T, Meta, K>>
        const snapshotContainerResolved = await snapshotContainer;

        // Handle the snapshot if snapshotId is not null
        if (id !== null && snapshotId !== null && snapshot !== null) {
          snapshot(
            id,
            `${snapshotId}`,
            snapshotContainerResolved.snapshotData as unknown as SnapshotData<T, Meta, K>,
              category,
            categoryProperties,
            async (snapshotStore: SnapshotStore<T, Meta, K> | null) => {
              // Handle the snapshotStore as needed
              const shouldUpdateState = true; // Replace with actual condition
              const shouldLog = true; // Replace with actual condition
              const shouldUpdateUI = false; // Replace with actual condition

              if (
                'storeId' in snapshotContainerResolved.snapshotData && 
                snapshotContainerResolved.snapshotData && 
                !(snapshotContainerResolved.snapshotData instanceof Map)
              ) {
                const storeId = snapshotContainerResolved.snapshotData.storeId;
                if (!storeId) {
                  throw new Error(`not storeId associated with ${snapshotContainerResolved.name}`);
                  // Use storeId as needed
                }
        
                const snapshotStore = await snapshotApi.getSnapshotStore(storeId, snapshotContainerResolved, criteria);
              if (shouldUpdateState) {
                  // Update the state with the snapshotStore
                  dispatch((await useSnapshotStore(addToSnapshotList, storeProps)).updateSnapshotStore(await snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback));
                }

                if (shouldLog) {
                  if(!snapshot){
                    throw Error("Snapshot is null");
                  }
                  // Log the snapshotStore data
                  console.log('Snapshot store updated:', snapshot);
                  // or send it to an analytics service
                  sendToAnalytics('snapshotStoreUpdated', {}, snapshot);
                }
                
                if (shouldUpdateUI) {
                  // Update the UI with the snapshotStore
                  updateUIWithSnapshotStore(snapshot);
                }
              }
            },
            {} as DataStore<T, Meta, K>,
            {} as DataStoreMethods<T, Meta, K>,
            {} as UnifiedMetaDataOptions,
            `${subscriberId}`,
            `${endpointCategory}`,
            storeProps,
            snapshotConfigData,// Use the snapshotStoreConfig from the response or undefined if null
            subscription,
            snapshotStoreConfig,
            snapshotContainer
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

  })
}


const getSnapshotStoreConfigData = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, Meta, K>,
  criteria: CriteriaType,
  storeId: number,
  config: SnapshotStoreConfig<SnapshotWithCriteria<Data, any>, any>
): Promise<SnapshotConfig<T, Meta, K>> => {
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
      const response = await axiosInstance.post<SnapshotConfig<T, Meta, K>>(
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


const getSnapshotConfigData = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, Meta, K>,
  criteria: CriteriaType,
  storeId: number):
  Promise<SnapshotConfig<T, Meta, K>> => {
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
      const response = await axiosInstance.post<SnapshotConfig<T, Meta, K>>(
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
}

const getSnapshotStoreConfig = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, Meta, K>,
  criteria: CriteriaType,
  storeId: number
): Promise<SnapshotStoreConfig<T, Meta, K>> => {
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
      const response = await axiosInstance.post<SnapshotStoreConfig<T, Meta, K>>(
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

const getSnapshotStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  storeId: number,
  snapshotContainer: SnapshotContainer<T, Meta, K>,
  criteria: CriteriaType
): Promise<SnapshotStore<T, Meta, K>> => {
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
      const response = await axiosInstance.post<SnapshotStore<T, Meta, K>>(
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



// const findSnapshotsBySubscriber = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
//   subscriberId: string,
//   category?: string,
//   endpointCategory?: string
// ): Promise<Snapshot<T, Meta, K>[]> => {
//   try {
//     // Construct the request URL or payload based on parameters
//     const url = new URL('/api/snapshots', 'https://yourapi.example.com');
//     const params = new URLSearchParams();
//     params.append('subscriberId', subscriberId);

//     if (category) {
//       params.append('category', category);
//     }

//     if (endpointCategory) {
//       params.append('endpointCategory', endpointCategory);
//     }

//     url.search = params.toString();

//     // Perform the API request
//     const response = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         // Include authentication or other headers if necessary
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Error fetching snapshots: ${response.statusText}`);
//     }

//     // Parse the response data
//     const data: Snapshot<T, Meta, K>[] = await response.json();

//     // Return the snapshots
//     return data;

//   } catch (error) {
//     console.error("Error in findSnapshotsBySubscriber:", error);
//     // Handle or rethrow the error as needed
//     throw error;
//   }
// },


export {
  addSnapshot,
  addSnapshotSuccess, apiCall, createSnapshot, extractCriteria, fetchAllSnapshots, fetchSnapshotById,
  fetchSnapshotIds, fetchSnapshotStoreData, findSnapshotsBySubscriber, findSubscriberById, getCurrentSnapshot, getSnapshot, getSnapshotConfig, getSnapshotConfigData, getSnapshotContainer, getSnapshotCriteria, getSnapshotData,
  getSnapshotId, getSnapshots, getSnapshotStore,
  getSnapshotStoreConfig, getSnapshotStoreConfigData, getSnapshotStoreId, getSortedList,
  handleOtherApplicationLogic, handleOtherStatusCodes, handleSpecificStatusCode,
  mergeSnapshots, removeSnapshot, saveSnapshotToDatabase, snapshotContainer, takeSnapshot
};

