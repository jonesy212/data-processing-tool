import * as snapshotApi from '@/app/api/SnapshotApi';
import { AxiosError } from "axios";
import { useDispatch } from 'react-redux';
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
import { DataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { sendToAnalytics } from '../components/projects/DataAnalysisPhase/sendToAnalytics';
import { ProjectType } from "../components/projects/Project";
import { ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotData, SnapshotDataType, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria, useSnapshotStore } from "../components/snapshots";
import {
  Snapshot,
  Snapshots
} from "../components/snapshots/LocalStorageSnapshotStore";
import { SnapshotContainer } from "../components/snapshots/SnapshotContainer";
import SnapshotList from "../components/snapshots/SnapshotList";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { isValidFileCategory } from "../components/snapshots/isValidFileCategory";
import { updateUIWithSnapshotStore } from '../components/snapshots/updateUIWithSnapshotStore';
import { FilterState } from "../components/state/redux/slices/FilterSlice";
import CalendarManagerStoreClass from '../components/state/stores/CalendarEvent';
import {
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import { Subscriber } from '../components/users/Subscriber';
import { addToSnapshotList } from "../components/utils/snapshotUtils";
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
const apiCall = <T extends Data, K extends Data>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K>> => {
  return new Promise<Snapshot<T, K>>(async (resolve, reject) => {
    try {
      const headers = createHeaders(additionalHeaders);
      const response = await axiosInstance({
        url,
        method,
        headers: headers as Record<string, string>,
        data
      });

      if (response.status === 200) {
        resolve(response.data as Snapshot<T, K>);
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


const getSnapshot = <T extends Data, K extends Data>(
  snapshotId: string | number,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K>> => {
  return new Promise((resolve, reject) => {
    // synchronous logic here
    const snapshot: Snapshot<T, K> = {/* logic to fetch snapshot */} as Snapshot<T, K>;
    if (snapshot) {
      resolve(snapshot);
    } else {
      reject('Snapshot not found');
    }
  });
};

// Get snapshot data with proper type handling
function getSnapshotData<T extends Data, K extends Data>(
  snapshotId: string | number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K> | undefined> {
  return apiCall<T, K>(
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


const findSubscriberById = async  <T extends BaseData, K extends BaseData>(
  subscriberId: string,
  category: symbol | string | Category | undefined,
  endpointCategory: string | number
): Promise<Subscriber<T, K>> => {
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



const findSnapshotsBySubscriber = async <T extends BaseData, K extends BaseData>(
  subscriberId: string,
  category: symbol | string | Category | undefined,
  endpointCategory: string | number,
  snapshotConfig: SnapshotConfig<T, K>
): Promise<Snapshot<T, K>[]> => {
  const target: Target = constructTarget(
    endpointCategory,
    `${endpoints.snapshots.list}?subscriberId=${subscriberId}&category=${String(category)}`
  );
  
  const headers: Record<string, any> = createRequestHeaders(String(target.url));

  if (!target.url) {
    throw new Error("Target URL is undefined");
  }

  try {
    // Fetch snapshots from the API
    const response = await axiosInstance.get(target.url, {
      headers: headers as Record<string, string>,
    });

    // Assuming the API response contains the necessary snapshot data
    const snapshotsData: SnapshotDataType<T, K>[] = response.data;

    // Map the API response to the Snapshot<T, K> type
    const snapshots: Snapshot<T, K>[] = snapshotsData.flatMap((snapshotData) => {
      if (!snapshotData) {
        throw new Error("Snapshot data is undefined");
      }
    
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


          criteria: entry.criteria,
          snapshotContainer: entry.snapshotContainer,
          snapshotCategory: entry.snapshotCategory,
          snapshotSubscriberId: entry.snapshotSubscriberId,
         
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
          createSnapshot: entry.createSnapshot,
          createInitSnapshot: entry.createInitSnapshot,
          addStoreConfig: entry.addStoreConfig,
          handleSnapshotConfig: entry.handleSnapshotConfig,
          getSnapshotConfig: entry.getSnapshotConfig,
          getSnapshotListByCriteria: entry.getSnapshotListByCriteria,
          setSnapshotSuccess: entry.setSnapshotSuccess,
          setSnapshotFailure: entry.setSnapshotFailure,
          updateSnapshots: entry.updateSnapshots,
          updateSnapshotsSuccess: entry.updateSnapshotsSuccess,
          updateSnapshotsFailure: entry.updateSnapshotsFailure,
          initSnapshot: entry.initSnapshot,
          takeSnapshot: entry.takeSnapshot,
          takeSnapshotSuccess: entry.takeSnapshotSuccess,
          takeSnapshotsSuccess: entry.takeSnapshotsSuccess,
          flatMap: entry.flatMap,
          getState: entry.getState,
          setState: entry.setState,
          validateSnapshot: entry.validateSnapshot,
          handleActions: entry.handleActions,
          setSnapshot: entry.setSnapshot,
          transformSnapshotConfig: entry.transformSnapshotConfig,
          setSnapshots: entry.setSnapshots,
          clearSnapshot: entry.clearSnapshot,
          mergeSnapshots: entry.mergeSnapshots,
          reduceSnapshots: entry.reduceSnapshots,
          sortSnapshots: entry.sortSnapshots,
          filterSnapshots: entry.filterSnapshots,
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
    
      // Otherwise, assume it's SnapshotData<T, K> and access its properties
      return {
        id: snapshotData.id,
        data: snapshotData.data,
        metadata: snapshotData.metadata,
        initialState: snapshotData.data as T,  // Provide default value or mapping
        isCore: true,  // Set default value if not available
        initialConfig: snapshotData.snapConfig.initialConfig,  // Provide or map to default config

        criteria: snapshotData.snapConfig.criteria,
        snapshotContainer: snapshotData.snapConfig.snapshotContainer,
        snapshotCategory: snapshotData.snapConfig.snapshotCategory,
        snapshotSubscriberId: snapshotData.snapConfig.snapshotSubscriberId,

        storeId: snapshotData.storeId,
        snapConfig: snapshotData.snapConfig,
        snapshot: snapshotData.snapshot,
        emit: snapshotData.snapConfig.emit, 
        createSnapshot: snapshotData.snapConfig.createSnapshot ?? null, 
        createInitSnapshot: snapshotData.snapConfig.createInitSnapshot, 
        addStoreConfig: snapshotData.snapConfig.addStoreConfig, 
        handleSnapshotConfig: snapshotData.snapConfig.handleSnapshotConfig, 
        getSnapshotConfig: snapshotData.snapConfig.getSnapshotConfig,

        getSnapshotListByCriteria: snapshotData.snapConfig.getSnapshotListByCriteria, 
        setSnapshotSuccess: snapshotData.snapConfig.setSnapshotSuccess, 
        setSnapshotFailure: snapshotData.snapConfig.setSnapshotFailure,

        updateSnapshots: snapshotData.snapConfig.updateSnapshots, 
        updateSnapshotsSuccess: snapshotData.snapConfig.updateSnapshotsSuccess, 
        updateSnapshotsFailure: snapshotData.snapConfig.updateSnapshotsFailure,

        initSnapshot: snapshotData.snapConfig.initSnapshot, 
        takeSnapshot: snapshotData.snapConfig.takeSnapshot, 
        takeSnapshotSuccess: snapshotData.snapConfig.takeSnapshotSuccess,

        takeSnapshotsSuccess: snapshotData.snapConfig.takeSnapshotsSuccess, 
        flatMap: snapshotData.snapConfig.flatMap, 
        getState: snapshotData.snapConfig.getState,

        setState: snapshotData.snapConfig.setState, 
        validateSnapshot: snapshotData.snapConfig.validateSnapshot, 
        handleActions: snapshotData.snapConfig.handleActions,

        setSnapshot: snapshotData.snapConfig.setSnapshot, 
        transformSnapshotConfig: snapshotData.snapConfig.transformSnapshotConfig, 
        setSnapshots: snapshotData.snapConfig.setSnapshots,

        clearSnapshot: snapshotData.snapConfig.clearSnapshot, 
        mergeSnapshots: snapshotData.snapConfig.mergeSnapshots, 
        reduceSnapshots: snapshotData.snapConfig.reduceSnapshots,

        sortSnapshots: snapshotData.snapConfig.sortSnapshots, 
        filterSnapshots: snapshotData.snapConfig.filterSnapshots, 
        findSnapshot: snapshotData.snapConfig.findSnapshot,

        mapSnapshots: snapshotData.snapConfig.mapSnapshots, 
        takeLatestSnapshot: snapshotData.snapConfig.takeLatestSnapshot, 
        updateSnapshot: snapshotData.snapConfig.updateSnapshot,

        addSnapshotSubscriber: snapshotData.snapConfig.addSnapshotSubscriber, 
        removeSnapshotSubscriber: snapshotData.snapConfig.removeSnapshotSubscriber, 
        getSnapshotConfigItems: snapshotData.snapConfig.getSnapshotConfigItems,

        subscribeToSnapshots: snapshotData.snapConfig.subscribeToSnapshots, 
        executeSnapshotAction: snapshotData.snapConfig.executeSnapshotAction, 
        subscribeToSnapshot: snapshotData.snapConfig.subscribeToSnapshot,

        unsubscribeFromSnapshot: snapshotData.snapConfig.unsubscribeFromSnapshot, 
        subscribeToSnapshotsSuccess: snapshotData.snapConfig.subscribeToSnapshotsSuccess, 
        unsubscribeFromSnapshots: snapshotData.snapConfig.unsubscribeFromSnapshots,

        getSnapshotItemsSuccess: snapshotData.snapConfig.getSnapshotItemsSuccess, 
        getSnapshotItemSuccess: snapshotData.snapConfig.getSnapshotItemSuccess, 
        getSnapshotKeys: snapshotData.snapConfig.getSnapshotKeys, 

        getSnapshotIdSuccess: snapshotData.snapConfig.getSnapshotIdSuccess, 
        getSnapshotValuesSuccess: snapshotData.snapConfig.getSnapshotValuesSuccess, 
        getSnapshotWithCriteria: snapshotData.snapConfig.getSnapshotWithCriteria,

        reduceSnapshotItems: snapshotData.snapConfig.reduceSnapshotItems, 
        subscribeToSnapshotList: snapshotData.snapConfig.subscribeToSnapshotList, 
        config: snapshotData.snapConfig.config,

        timestamp: snapshotData.snapConfig.timestamp, 
        label: snapshotData.snapConfig.label, 
        events: snapshotData.events, 
        restoreSnapshot: snapshotData.snapConfig.restoreSnapshot, 
        handleSnapshot: snapshotData.snapConfig.handleSnapshot, 
        subscribe: snapshotData.snapConfig.subscribe,

        meta: snapshotData.snapConfig.meta, 
        items: snapshotData.items, 
        subscribers: snapshotData.subscribers, 
        snapshotStore: snapshotData.snapshotStore, 
        setSnapshotCategory: snapshotData.setSnapshotCategory, 
        getSnapshotCategory: snapshotData.getSnapshotCategory,

        getSnapshotData: snapshotData.getSnapshotData, 
        deleteSnapshot: snapshotData.deleteSnapshot, 
        getSnapshots: snapshotData.getSnapshots, 
        compareSnapshots: snapshotData.compareSnapshots, 
        compareSnapshotItems: snapshotData.compareSnapshotItems, 
        batchTakeSnapshot: snapshotData.batchTakeSnapshot,

        batchFetchSnapshots: snapshotData.batchFetchSnapshots, 
        batchTakeSnapshotsRequest: snapshotData.batchTakeSnapshotsRequest, 
        batchUpdateSnapshotsRequest: snapshotData.batchUpdateSnapshotsRequest,

        filterSnapshotsByStatus: snapshotData.filterSnapshotsByStatus, 
        filterSnapshotsByCategory: snapshotData.filterSnapshotsByCategory, 
        filterSnapshotsByTag: snapshotData.filterSnapshotsByTag, 

        batchFetchSnapshotsSuccess: snapshotData.batchFetchSnapshotsSuccess, 
        batchFetchSnapshotsFailure: snapshotData.batchFetchSnapshotsFailure, 
        batchUpdateSnapshotsSuccess: snapshotData.batchUpdateSnapshotsSuccess,

        batchUpdateSnapshotsFailure: snapshotData.batchUpdateSnapshotsFailure, 
        handleSnapshotSuccess: snapshotData.handleSnapshotSuccess, 
        getSnapshotId: snapshotData.getSnapshotId,

        compareSnapshotState: snapshotData.compareSnapshotState, 
        payload: snapshotData.payload, 
        dataItems: snapshotData.dataItems, 
        newData: snapshotData.newData, 
        getInitialState: snapshotData.getInitialState, 
        getConfigOption: snapshotData.getConfigOption,

        getTimestamp: snapshotData.getTimestamp, 
        getStores: snapshotData.getStores, 
        getData: snapshotData.getData, 
         setData: snapshotData.setData, 
        addData: snapshotData.addData, 
        stores: snapshotData.stores,

        getStore: snapshotData.getStore, 
        addStore: snapshotData.addStore, 
        mapSnapshot: snapshotData.mapSnapshot, 
        mapSnapshotWithDetails: snapshotData.mapSnapshotWithDetails, 
        removeStore: snapshotData.removeStore, 
        unsubscribe: snapshotData.unsubscribe, 

        fetchSnapshot: snapshotData.fetchSnapshot, 
        fetchSnapshotSuccess: snapshotData.fetchSnapshotSuccess, 
        updateSnapshotFailure: snapshotData.updateSnapshotFailure,

        fetchSnapshotFailure: snapshotData.fetchSnapshotFailure, 
        addSnapshotFailure: snapshotData.addSnapshotFailure, 
        configureSnapshotStore: snapshotData.configureSnapshotStore, 

        updateSnapshotSuccess: snapshotData.updateSnapshotSuccess, 
        createSnapshotFailure: snapshotData.createSnapshotFailure, 
        createSnapshotSuccess: snapshotData.createSnapshotSuccess,

        createSnapshots: snapshotData.createSnapshots, 
        onSnapshot: snapshotData.onSnapshot, 
        onSnapshots: snapshotData.onSnapshots, 
        childIds: snapshotData.snapConfig.childIds, 
        getParentId: snapshotData.snapConfig.getParentId, 
        getChildIds: snapshotData.snapConfig.getChildIds,

        addChild: snapshotData.snapConfig.addChild, 
        removeChild: snapshotData.snapConfig.removeChild, 
        getChildren: snapshotData.snapConfig.getChildren, 
        hasChildren: snapshotData.snapConfig.hasChildren, 
        isDescendantOf: snapshotData.snapConfig.isDescendantOf, 
        getSnapshotById: snapshotData.snapConfig.getSnapshotById,

        removeSubscriber: snapshotData.snapConfig.removeSubscriber,
        onInitialize: snapshotData.snapConfig.onInitialize,
        onError: snapshotData.snapConfig.onError,
        taskIdToAssign: snapshotData.snapConfig.taskIdToAssign,
        schema: snapshotData.snapConfig.schema,
        currentCategory: snapshotData.snapConfig.currentCategory,
        mappedSnapshotData: snapshotData.snapConfig.mappedSnapshotData,
        
        setCategory: snapshotData.snapConfig.setCategory,
        applyStoreConfig: snapshotData.snapConfig.applyStoreConfig,
        generateId: snapshotData.generateId,
        snapshotData: snapshotData.snapConfig.snapshotData,
        getSnapshotItems: snapshotData.snapConfig.getSnapshotItems,
        defaultSubscribeToSnapshots: snapshotData.snapConfig.defaultSubscribeToSnapshots,
        notify: snapshotData.notify,
        notifySubscribers: snapshotData.notifySubscribers,
        getAllSnapshots: snapshotData.getAllSnapshots,
        getSubscribers: snapshotData.snapConfig.getSubscribers,
        versionInfo: snapshotData.snapConfig.versionInfo,
        transformSubscriber: snapshotData.snapConfig.transformSubscriber,
        transformDelegate: snapshotData.snapConfig.transformDelegate,
        initializedState: snapshotData.snapConfig.initializedState,
        getAllKeys: snapshotData.snapConfig.getAllKeys,
        getAllValues: snapshotData.snapConfig.getAllValues,
        getAllItems: snapshotData.snapConfig.getAllItems,
        getSnapshotEntries: snapshotData.snapConfig.getSnapshotEntries,
        getAllSnapshotEntries: snapshotData.snapConfig.getAllSnapshotEntries,
        
        addDataStatus: snapshotData.snapConfig.addDataStatus,
        removeData: snapshotData.snapConfig.removeData,
        updateData: snapshotData.snapConfig.updateData,

        updateDataTitle: snapshotData.snapConfig.updateDataTitle,
        updateDataDescription: snapshotData.snapConfig.updateDataDescription,
        updateDataStatus: snapshotData.snapConfig.updateDataStatus,
        addDataSuccess: snapshotData.snapConfig.addDataSuccess,
        getDataVersions: snapshotData.snapConfig.getDataVersions,
        updateDataVersions: snapshotData.snapConfig.updateDataVersions,

        getBackendVersion: snapshotData.snapConfig.getBackendVersion,
        getFrontendVersion: snapshotData.snapConfig.getFrontendVersion,
        fetchData: snapshotData.snapConfig.fetchData,
        defaultSubscribeToSnapshot: snapshotData.snapConfig.defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: snapshotData.snapConfig.handleSubscribeToSnapshot,
        removeItem: snapshotData.snapConfig.removeItem,
        getSnapshot: snapshotData.snapConfig.getSnapshot,
        getSnapshotSuccess: snapshotData.snapConfig.getSnapshotSuccess,
        setItem: snapshotData.snapConfig.setItem,
        getItem: snapshotData.snapConfig.getItem,
        getDataStore: snapshotData.snapConfig.getDataStore,
        getDataStoreMap: snapshotData.snapConfig.getDataStoreMap,
        addSnapshotSuccess: snapshotData.snapConfig.addSnapshotSuccess,
        deepCompare: snapshotData.snapConfig.deepCompare,
        shallowCompare: snapshotData.snapConfig.shallowCompare,
        getDataStoreMethods: snapshotData.snapConfig.getDataStoreMethods,
        getDelegate: snapshotData.snapConfig.getDelegate,
        determineCategory: snapshotData.snapConfig.determineCategory,

        determinePrefix: snapshotData.snapConfig.determinePrefix,
        removeSnapshot: snapshotData.snapConfig.removeSnapshot,
        addSnapshotItem: snapshotData.snapConfig.addSnapshotItem,
        addNestedStore: snapshotData.snapConfig.addNestedStore,
        clearSnapshots: snapshotData.snapConfig.clearSnapshots,
        addSnapshot: snapshotData.snapConfig.addSnapshot,

      };
    });
    

    return snapshots;
  } catch (error) {
    console.error("Error fetching snapshots by subscriber:", error);
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

const snapshotContainer = <T extends Data, K extends Data>(
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

function getCurrentSnapshot<T extends Data, K extends Data>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K> | null> {
  return new Promise((resolve, reject) => {
    snapshotApi.getSnapshot<T, K>(snapshotId, storeId, additionalHeaders)
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

function getSnapshotContainer<T extends Data, K extends Data>(
  snapshotId: string,
  storeId: number
): Promise<SnapshotContainer<T, K>> {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fetchSnapshotContainerData(snapshotId);

      // Organize properties in logical groups
      const snapshotContainer: SnapshotContainer<T, K> = {
        id: data.id,
        /**  Snapshot Data */
        data: data.data,
        items: data.items,
        config: data.config,
        isCore: data.isCore,
        storeId: data.storeId,


        criteria: data.criteria,
        content: data.content,
        snapshotCategory: data.snapshotCategory,
        snapshotSubscriberId: data.snapshotSubscriberId,
       


        getSnapshots: data.getSnapshots,
        getAllSnapshots: data.getAllSnapshots,
        handleSnapshotSuccess: data.handleSnapshotSuccess,
        unsubscribe: data.unsubscribe,
        createSnapshots: data.createSnapshots,

        initialConfig: data.initialConfig,
        removeSubscriber: data.removeSubscriber,
        onInitialize: data.onInitialize,
        onError: data.onError,
       
        /** Snapshot Management **/
        snapshotStore: data.snapshotStore,
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
        getSnapshotId,

        /** Batch Operations **/
        batchTakeSnapshot: data.batchTakeSnapshot,
        batchFetchSnapshots: data.batchFetchSnapshots,
        batchTakeSnapshotsRequest: data.batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: data.batchUpdateSnapshotsRequest,
        batchFetchSnapshotsSuccess: data.batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: data.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: data.batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: data.batchUpdateSnapshotsFailure,

        /** Snapshot Filters **/
        filterSnapshotsByStatus: data.filterSnapshotsByStatus,
        filterSnapshotsByCategory: data.filterSnapshotsByCategory,
        filterSnapshotsByTag: data.filterSnapshotsByTag,

        /** Store Management **/
        stores: data.stores,
        getStores: data.getStores,
        getStore: data.getStore,
        addStore: data.addStore,
        removeStore: data.removeStore,
        configureSnapshotStore: data.configureSnapshotStore,

        /** Data Management **/
        getData: data.getData,
        setData: data.setData,
        addData: data.addData,
        dataItems: data.dataItems,
        newData: data.newData,

        /** Notification and Subscribers **/
        notify: data.notify,
        notifySubscribers: data.notifySubscribers,
        subscribers: data.subscribers,
        onSnapshot: data.onSnapshot,
        onSnapshots: data.onSnapshots,
        events: data.events,

        /** Children Management **/
        childIds: data.childIds,
        getParentId: data.getParentId,
        getChildIds: data.getChildIds,
        addChild: data.addChild,
        removeChild: data.removeChild,
        getChildren: data.getChildren,
        hasChildren: data.hasChildren,
        isDescendantOf: data.isDescendantOf,

        /** Utility and Miscellaneous **/
        timestamp: data.timestamp || new Date(),
        currentCategory: data.currentCategory || undefined,
        mappedSnapshotData: new Map<string, Snapshot<T, K>>(),
        setSnapshotCategory: data.setSnapshotCategory || ((id: string, newCategory: string | Category) => {
          // Implementation for setting the category
        }),

        getSnapshotCategory: data.getSnapshotCategory || ((id: string): Category | undefined => {
          // Implementation for getting the category
          return undefined; // Modify as needed
        }),
        compareSnapshots: data.compareSnapshots,
        compareSnapshotItems: data.compareSnapshotItems,
        compareSnapshotState: data.compareSnapshotState,
        payload: data.payload,
        getInitialState: data.getInitialState,
        getConfigOption: data.getConfigOption,
        getTimestamp: data.getTimestamp,
        generateId: data.generateId,

        /** Snapshot Mapping **/
        mapSnapshot: data.mapSnapshot,
        mapSnapshotWithDetails: data.mapSnapshotWithDetails,

        /** Snapshot Function **/
        snapshot: data.snapshot || (async (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: SnapshotDataType<T, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>[],
          metadata: UnifiedMetaDataOptions
        ): Promise<{ snapshot: Snapshot<T, K> }> => {
          // Implementation for creating or fetching a snapshot
          return { snapshot: {} as Snapshot<T, K> };
        }),
      };

      resolve(snapshotContainer);
    } catch (error) {
      console.error("Error retrieving SnapshotContainer:", error);
      reject(error);
    }
  });
}

// Example placeholder function to simulate fetching data
async function fetchSnapshotContainerData(snapshotId: string): Promise<any> {
  // Simulate fetching data, e.g., from an API or database
  return {
    timestamp: new Date(),
    currentCategory: "defaultCategory" // Example default value
  };
}




function extractCriteria<T extends Data, K extends Data>(
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
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Snapshot<T, K>) => void,
    criteria: CriteriaType,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    snapshotContainerData?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Promise<SnapshotData<T, K>>,
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




const getSnapshotConfig = <T extends Data, K extends Data>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  delegate: any,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotDataType<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStoreMethods: DataStore<T, K>,
    metadata: UnifiedMetaDataOptions,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number ,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Promise<Snapshot<T, K>>,
    data: Map<string, Snapshot<T, K>>, // Added prop
  events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
  dataItems: RealtimeDataItem[], // Added prop
  newData: Snapshot<T, K>, // Added prop
  payload: ConfigureSnapshotStorePayload<T, K>, // Added prop
  store: SnapshotStore<any, K>, // Added prop
  callback: (snapshotStore: SnapshotStore<T, K>) => void, // Added prop
  storeProps: SnapshotStoreProps<T, K>,
  endpointCategory: string | number
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
            snapshotContainer.snapshotData ?? snapshotContainer.snapshotData,
            category,
            categoryProperties,
            async (snapshotStore: SnapshotStore<T, K>) => {
              // Handle the snapshotStore as needed
              const shouldUpdateState = true; // Replace with actual condition
              const shouldLog = true; // Replace with actual condition
              const shouldUpdateUI = false; // Replace with actual condition

              if (shouldUpdateState) {
                // Update the state with the snapshotStore
                dispatch((await useSnapshotStore(addToSnapshotList, storeProps)).updateSnapshotStore(snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback));
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
            {} as DataStore<T, K>,
            snapshotContainer.metadata ?? ({} as UnifiedMetaDataOptions),
            endpointCategory,
            storeProps,
            snapshotConfigData.snapshotStoreConfig ?? undefined,// Use the snapshotStoreConfig from the response or undefined if null
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


const getSnapshotStoreConfigData = <T extends Data, K extends Data>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  storeId: number,
  config: SnapshotStoreConfig<SnapshotWithCriteria<Data, any>, any>
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


const getSnapshotConfigData = <T extends Data, K extends Data>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  storeId: number):
  Promise<SnapshotConfig<T, K>> => {
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
}

const getSnapshotStoreConfig = <T extends Data, K extends Data>(
  snapshotId: string | null,
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



// const findSnapshotsBySubscriber = <T extends Data, K extends Data>(
//   subscriberId: string,
//   category?: string,
//   endpointCategory?: string
// ): Promise<Snapshot<T, K>[]> => {
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
//     const data: Snapshot<T, K>[] = await response.json();
    
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

