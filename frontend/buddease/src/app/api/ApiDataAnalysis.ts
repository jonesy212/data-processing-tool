// ApiDataAnalysis.ts
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import {
    NotificationType,
    useNotification
} from "@/app/components/support/NotificationContext";
import { AxiosError, AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { BaseData } from "../components/models/data/Data";
import { PriorityTypeEnum } from "../components/models/data/StatusType";
import { DataAnalysisResult } from "../components/projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { isYourResponseType, isSnapshotStore } from "../components/typings/YourSpecificSnapshotType";
import { YourResponseType } from "@/app/components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
import { isSnapshot } from "../components/utils/snapshotUtils";
import { T } from '../components/models/data/dataStoreMethods';
import SnapshotStore from '../components/snapshots/SnapshotStore';
import { createSnapshot } from '../components/snapshots/createSnapshot';

const dispatch = useDispatch();
// Define the API base URL for data analysis

const DATA_ANALYSIS_BASE_URL = endpoints.dataAnalysis;


// Validate and extract the endpoint

const getEndpoint = (): string => {
  if (typeof DATA_ANALYSIS_BASE_URL !== "object" || !DATA_ANALYSIS_BASE_URL) {
    throw new Error("DATA_ANALYSIS_BASE_URL is not an object or is null/undefined");
  }

  const sentimentAnalysisEndpoint = DATA_ANALYSIS_BASE_URL.getSentimentAnalysisResults;

  if (typeof sentimentAnalysisEndpoint !== "string") {
    throw new Error("Endpoint getSentimentAnalysisResults is not a string");
  }

  return sentimentAnalysisEndpoint;
};




interface DataAnalysisNotificationMessages {
  ANALYZE_DATA_SUCCESS: string;
  ANALYZE_DATA_ERROR: string;
  // GET_ANALYSIS_RESULTS_SUCCESS: string;
  // GET_ANALYSIS_RESULTS_ERROR: string;
  FETCH_ANALYSIS_RESULTS_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages for data analysis
const dataAnalysisNotificationMessages: DataAnalysisNotificationMessages = {
  ANALYZE_DATA_SUCCESS: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_SUCCESS,
  ANALYZE_DATA_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_ERROR,
  FETCH_ANALYSIS_RESULTS_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ANALYSIS_RESULTS_ERROR,
  // Add more properties as needed
};

// Function to handle API errors and notify for data analysis
export const handleDataAnalysisApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof DataAnalysisNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dataAnalysisNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "DATA_ANALYSIS_API_CLIENT_ERROR" as NotificationType
    );
  }
};


export function fetchDataAnalysis<
  T extends BaseData,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  endpoint: string,
  text?: string
): Promise<YourResponseType<T, K, Meta> | Snapshot<T, K, Meta>> {
  const fetchDataAnalysisEndpoint = `${DATA_ANALYSIS_BASE_URL}${endpoint}`;
  const config = {
    headers: headersConfig,
    params: text ? { text } : undefined,
  };

  return axiosInstance
    .get<YourResponseType<T, K, Meta> | Snapshot<T, K, Meta>>(fetchDataAnalysisEndpoint, config)
    .then((response: AxiosResponse<YourResponseType<T, K, Meta,>> | Snapshot<T, K, Meta, , never>>) => {
      const data = response.data;

      if (isSnapshotStore<T, K, Meta>(data)) {
        return data as SnapshotStore<T, K, Meta>;
      } else if (isSnapshot<T, K, Meta>(data)) {
        return data as Snapshot<T, K, Meta>;
      } else {
        return data as YourResponseType<T, K, Meta>;
      }
    })
    .catch((error) => {
      console.error("Error fetching data analysis:", error);
      const errorMessage = "Failed to fetch data analysis";
      handleDataAnalysisApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        "FETCH_ANALYSIS_RESULTS_ERROR"
      );
      return Promise.reject(error);
    });
}



// Function to fetch analysis results
export const fetchAnalysisResults = <
  T extends  BaseData<any>,
  K extends T = T
>(): Promise<any> => {
  const endpoint = DATA_ANALYSIS_BASE_URL.getAnalysisResults;

  if (typeof endpoint !== "string") {
    return Promise.reject(new Error("Endpoint is not a string"));
  }

  return fetchDataAnalysis<T, K>(endpoint)
    .then((response) => {
      // Type guard to check if response is a Snapshot or YourResponseType
      if ("data" in response && response.data) {
        const analysisResults = response.data;

        // Check if analysisResults is of type DataAnalysisResult
        if (!isDataAnalysisResult(analysisResults)) {
          return Promise.reject(new Error("Invalid response data"));
        }

        // Destructure analysisResults safely
        const { description, phase, priority, sentiment, snapshotStores, sentimentAnalysis, ...rest } = analysisResults;

        if (
          analysisResults.snapshotStores === undefined ||
          !analysisResults?.snapshotStores![0]
        ) {
          return Promise.reject(new Error("No snapshots available"));
        }

        // Return processed data
        return createSnapshot<BaseData, BaseData>({  
          ...rest,
          // Core Data
          dataObject: analysisResults.snapshotStores[0].dataObject,
          deleted: analysisResults.snapshotStores[0].deleted,
          createdBy: analysisResults.snapshotStores[0].createdBy,
          mappedSnapshot: analysisResults.snapshotStores[0].mappedSnapshot,

          // Subscription Management
          manageSubscription: analysisResults.snapshotStores[0].manageSubscription,
          keys: analysisResults.snapshotStores[0].keys,
          options: analysisResults.snapshotStores[0].options,
          structuredMetadata: analysisResults.snapshotStores[0].structuredMetadata,

          // Snapshot Retrieval
          get: analysisResults.snapshotStores[0].get,
          maxAge: analysisResults.snapshotStores[0].maxAge,
          getSnapshotsByTopic: analysisResults.snapshotStores[0].getSnapshotsByTopic,
          getSnapshotsByTopicSuccess: analysisResults.snapshotStores[0].getSnapshotsByTopicSuccess,
          getSnapshotsByCategory: analysisResults.snapshotStores[0].getSnapshotsByCategory,
          getSnapshotsByCategorySuccess: analysisResults.snapshotStores[0].getSnapshotsByCategorySuccess,
          getSnapshotsByKey: analysisResults.snapshotStores[0].getSnapshotsByKey,
          getSnapshotsByKeySuccess: analysisResults.snapshotStores[0].getSnapshotsByKeySuccess,
          getSnapshotsByPriority: analysisResults.snapshotStores[0].getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess: analysisResults.snapshotStores[0].getSnapshotsByPrioritySuccess,

          // Store Data Management
          getStoreData: analysisResults.snapshotStores[0].getStoreData,
          updateStoreData: analysisResults.snapshotStores[0].updateStoreData,
          #snapshotStores: base.#snapshotStores ?? new Map(),
          updateDelegate: analysisResults.snapshotStores[0].updateDelegate,

          autoSyncData: analysisResults.snapshotStores[0].autoSyncData,
          endpointCategory: analysisResults.snapshotStores[0].endpointCategory,
          findIndex: analysisResults.snapshotStores[0].findIndex,
          
          splice: analysisResults.snapshotStores[0].splice,
          getSnapshotStoreData: analysisResults.snapshotStores[0].getSnapshotStoreData,
          // Snapshot Operations
          getSnapshotContainer: analysisResults.snapshotStores[0].getSnapshotContainer,
          getSnapshotVersions: analysisResults.snapshotStores[0].getSnapshotVersions,
          getEventsAsRecord: analysisResults.snapshotStores[0].getEventsAsRecord,
          addSnapshotToStore: analysisResults.snapshotStores[0].addSnapshotToStore,
          updateSnapshotStore: analysisResults.snapshotStores[0].updateSnapshotStore,

          // Data Transformation
          mapDataStore: analysisResults.snapshotStores[0].mapDataStore,
          transformInitialState: analysisResults.snapshotStores[0].transformInitialState,
          transformSnapshot: analysisResults.snapshotStores[0].transformSnapshot,
          transformMappedSnapshotData: analysisResults.snapshotStores[0].transformMappedSnapshotData,
          transformSnapshotStore: analysisResults.snapshotStores[0].transformSnapshotStore,
          transformSnapshotMethod: analysisResults.snapshotStores[0].transformSnapshotMethod,

          // Store and Config Initialization
          initializeOptions: analysisResults.snapshotStores[0].initializeOptions,
          setConfig: analysisResults.snapshotStores[0].setConfig,
          initializeStores: analysisResults.snapshotStores[0].initializeStores,
          initializeDefaultConfigs: analysisResults.snapshotStores[0].initializeDefaultConfigs,

          // Notifications and Error Handling
          notifySuccess: analysisResults.snapshotStores[0].notifySuccess,
          notifyFailure: analysisResults.snapshotStores[0].notifyFailure,
          clearSnapshotFailure: analysisResults.snapshotStores[0].clearSnapshotFailure,

          // Snapshot Store CRUD
          findSnapshotStoreById: analysisResults.snapshotStores[0].findSnapshotStoreById,
          getSnapshotStores: analysisResults.snapshotStores[0].getSnapshotStores,
          defaultSaveSnapshotStore: analysisResults.snapshotStores[0].defaultSaveSnapshotStore,
          saveSnapshotStore: analysisResults.snapshotStores[0].saveSnapshotStore,
          _saveSnapshotStores: analysisResults.snapshotStores[0]._saveSnapshotStores,
          _saveSnapshotStore: analysisResults.snapshotStores[0]._saveSnapshotStore,
          defaultSaveSnapshotStores: analysisResults.snapshotStores[0].defaultSaveSnapshotStores,

          // Delegate and Subscriptions
          ensureDelegate: analysisResults.snapshotStores[0].ensureDelegate,
          getFirstDelegate: analysisResults.snapshotStores[0].getFirstDelegate,
          getInitialDelegate: analysisResults.snapshotStores[0].getInitialDelegate,
          transformedDelegate: analysisResults.snapshotStores[0].transformedDelegate,

          // Metadata and Configuration
          consolidateMetadata: analysisResults.snapshotStores[0].consolidateMetadata,
          getMetadata: analysisResults.snapshotStores[0].getMetadata,
          getProjectMetadata: analysisResults.snapshotStores[0].getProjectMetadata,
          getStructuredMetadata: analysisResults.snapshotStores[0].getStructuredMetadata,
          getSnapshotStoreConfig: analysisResults.snapshotStores[0].getSnapshotStoreConfig,
          defaultConfigs: analysisResults.snapshotStores[0].defaultConfigs,
          storeProps: analysisResults.snapshotStores[0].storeProps,
          callback: analysisResults.snapshotStores[0].callback,

          // Store Utilities
          getConfig: analysisResults.snapshotStores[0].getConfig,
          getName: analysisResults.snapshotStores[0].getName,
          getVersion: analysisResults.snapshotStores[0].getVersion,
          getSchema: analysisResults.snapshotStores[0].getSchema,

          // Data Store Handling
          dataStores: analysisResults.snapshotStores[0].dataStores,
          safeCastSnapshotStore: analysisResults.snapshotStores[0].safeCastSnapshotStore,
          getItems: analysisResults.snapshotStores[0].getItems,
          handleDelegate: analysisResults.snapshotStores[0].handleDelegate,

          // Mapped Data
          defaultCreateSnapshotStores: analysisResults.snapshotStores[0].defaultCreateSnapshotStores,
          createSnapshotStores: analysisResults.snapshotStores[0].createSnapshotStores,
          defaultOnSnapshots: analysisResults.snapshotStores[0].defaultOnSnapshots,
          filterInvalidSnapshots: analysisResults.snapshotStores[0].filterInvalidSnapshots,
          mapSnapshotsAO: analysisResults.snapshotStores[0].mapSnapshotsAO,

          // Snapshot Analysis
          getSnapshotIds: analysisResults.snapshotStores[0].getSnapshotIds,
          getSnapshotArray: analysisResults.snapshotStores[0].getSnapshotArray,
          getSavedSnapshotStore: analysisResults.snapshotStores[0].getSavedSnapshotStore,
          getSavedSnapshotStores: analysisResults.snapshotStores[0].getSavedSnapshotStores,
          getConfigs: analysisResults.snapshotStores[0].getConfigs,

          // Miscellaneous
          isCompatibleSnapshot: analysisResults.snapshotStores[0].isCompatibleSnapshot,
          isSnapshotStoreConfig: analysisResults.snapshotStores[0].isSnapshotStoreConfig,
          transformedSubscriber: analysisResults.snapshotStores[0].transformedSubscriber,
          isMobile: analysisResults.snapshotStores[0].isMobile,
          browserType: analysisResults.snapshotStores[0].browserType,

          // Snapshot Store Operations
          getTransformedSnapshot: analysisResults.snapshotStores[0].getTransformedSnapshot,
          getTransformedInitialState: analysisResults.snapshotStores[0].getTransformedInitialState,
          getFindSnapshotStoreById: analysisResults.snapshotStores[0].getFindSnapshotStoreById,
          determineSnapshotStoreCategory: analysisResults.snapshotStores[0].determineSnapshotStoreCategory,
          getNestedStores: analysisResults.snapshotStores[0].getNestedStores,

          // Snapshot and Store Payload
          getPayload: analysisResults.snapshotStores[0].getPayload,
          setPayload: analysisResults.snapshotStores[0].setPayload,
          getCallback: analysisResults.snapshotStores[0].getCallback,
          setCallback: analysisResults.snapshotStores[0].setCallback,
          getStoreProps: analysisResults.snapshotStores[0].getStoreProps,
          setStoreProps: analysisResults.snapshotStores[0].setStoreProps,
          getEndpointCategory: analysisResults.snapshotStores[0].getEndpointCategory,
          setEndpointCategory: analysisResults.snapshotStores[0].setEndpointCategory,

          // Security and Auditing
          auditRecords: analysisResults.snapshotStores[0].auditRecords,
          encrypt: analysisResults.snapshotStores[0].encrypt,
          decrypt: analysisResults.snapshotStores[0].decrypt,
          compress: analysisResults.snapshotStores[0].compress,

          // Temporary Data
          storeTempData: analysisResults.snapshotStores[0].storeTempData,
          getTempData: analysisResults.snapshotStores[0].getTempData,

          // Debugging
          addDebugInfo: analysisResults.snapshotStores[0].addDebugInfo,

          // Iterable support
          [Symbol.iterator]: data[Symbol.iterator],


          




          description: description ?? undefined,
          phase: phase ?? undefined,
          priority: priority as PriorityTypeEnum | undefined,

          schema: analysisResults.snapshotStores[0].getSchema(),
          storeId: analysisResults.snapshotStores[0].storeId,
          criteria: analysisResults.snapshotStores[0].criteria,
          snapshotContainer: analysisResults.snapshotStores[0].getSnapshotContainer(),
          
          snapConfig: analysisResults.snapConfig,
          snapshotCategory: analysisResults.snapshotCategory,
          snapshotSubscriberId: analysisResults.snapshotSubscriberId,
          initialState: analysisResults.initialState,
          timestamp: analysisResults.timestamp,
          label: analysisResults.label,
          


          // Data Analysis
          data: analysisResults.data,
          sentiment: analysisResults.sentiment,
          sentimentAnalysis: analysisResults.sentimentAnalysis,
          events: analysisResults.events,
          meta: analysisResults.meta,
          initialConfig: analysisResults.initialConfig,
          config: analysisResults.config,

          // Snapshot Management
          snapshot: analysisResults.snapshot,
          payload: analysisResults.payload,
          snapshotData: analysisResults.snapshotData,
          getSnapshotItems: analysisResults.getSnapshotItems,
          getSnapshot: analysisResults.getSnapshot,
          getAllSnapshots: analysisResults.getAllSnapshots,
          takeSnapshot: analysisResults.takeSnapshot,
          createSnapshot: analysisResults.createSnapshot,
          updateSnapshots: analysisResults.updateSnapshots,
          deleteSnapshot: analysisResults.deleteSnapshot,
          batchTakeSnapshot: analysisResults.batchTakeSnapshot,
          batchFetchSnapshots: analysisResults.batchFetchSnapshots,
          batchUpdateSnapshotsRequest: analysisResults.batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: analysisResults.batchFetchSnapshotsSuccess,
          batchUpdateSnapshotsSuccess: analysisResults.batchUpdateSnapshotsSuccess,
          batchFetchSnapshotsFailure: analysisResults.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsFailure: analysisResults.batchUpdateSnapshotsFailure,
          takeSnapshotSuccess: analysisResults.takeSnapshotSuccess,
          createSnapshotSuccess: analysisResults.createSnapshotSuccess,
          createSnapshotFailure: analysisResults.createSnapshotFailure,
          updateSnapshotSuccess: analysisResults.updateSnapshotSuccess,
          updateSnapshotFailure: analysisResults.updateSnapshotFailure,
          updateSnapshotsSuccess: analysisResults.updateSnapshotsSuccess,
          updateSnapshotsFailure: analysisResults.updateSnapshotsFailure,
          fetchSnapshotSuccess: analysisResults.fetchSnapshotSuccess,
          fetchSnapshotFailure: analysisResults.updateSnapshotFailure,
          getSnapshots: analysisResults.getSnapshots,
          getSnapshotId: analysisResults.getSnapshotId,
          getSnapshotWithCriteria: analysisResults.getSnapshotWithCriteria,
          getSnapshotConfigItems: analysisResults.getSnapshotConfigItems,
          compareSnapshots: analysisResults.compareSnapshots,
          compareSnapshotItems: analysisResults.compareSnapshotItems,
          mergeSnapshots: analysisResults.mergeSnapshots,
          reduceSnapshots: analysisResults.reduceSnapshots,
          sortSnapshots: analysisResults.sortSnapshots,
          filterSnapshots: analysisResults.filterSnapshots,
          findSnapshot: analysisResults.findSnapshot,
          takeLatestSnapshot: analysisResults.takeLatestSnapshot,
          restoreSnapshot: analysisResults.restoreSnapshot,
          clearSnapshots: analysisResults.clearSnapshots,
          setSnapshots: analysisResults.setSnapshots,
          clearSnapshot: analysisResults.clearSnapshot,
          handleSnapshot: analysisResults.handleSnapshot,
          handleSnapshotSuccess: analysisResults.handleSnapshotSuccess,
          getSnapshotData: analysisResults.getSnapshotData,

          // Snapshot Store Management
          snapshotStore: analysisResults.snapshotStore,
          configureSnapshotStore: analysisResults.configureSnapshotStore,
          getDataStore: analysisResults.getDataStore,
          addStoreConfig: analysisResults.addStoreConfig,
          getSnapshotConfig: analysisResults.getSnapshotConfig,
          handleSnapshotConfig: analysisResults.handleSnapshotConfig,
          getDataStoreMethods: analysisResults.getDataStoreMethods,
          addNestedStore: analysisResults.addNestedStore,
          removeStore: analysisResults.removeStore,

          removeSnapshot: analysisResults.removeSnapshot,
          getDataStoreMap: analysisResults.getDataStoreMap,

          // Subscriber Management
          subscribe: analysisResults.subscribe,
          removeSubscriber: analysisResults.removeSubscriber,
          onInitialize: analysisResults.onInitialize,
          onError: analysisResults.onError,
          defaultSubscribeToSnapshots: analysisResults.defaultSubscribeToSnapshots,
          defaultSubscribeToSnapshot: analysisResults.defaultSubscribeToSnapshot,
          subscribeToSnapshots: analysisResults.subscribeToSnapshots,
          handleSubscribeToSnapshot: analysisResults.handleSubscribeToSnapshot,
          unsubscribeFromSnapshot: analysisResults.unsubscribeFromSnapshot,
          subscribeToSnapshot: analysisResults.subscribeToSnapshot,
          notify: analysisResults.notify,
          notifySubscribers: analysisResults.notifySubscribers,
          getSubscribers: analysisResults.getSubscribers,
          addSnapshotSubscriber: analysisResults.addSnapshotSubscriber,
          removeSnapshotSubscriber: analysisResults.removeSnapshotSubscriber,
          subscribeToSnapshotList: analysisResults.subscribeToSnapshotList,
          unsubscribeFromSnapshots: analysisResults.unsubscribeFromSnapshots,

          // Data Operations
          addDataStatus: analysisResults.addDataStatus,
          removeData: analysisResults.removeData,
          updateData: analysisResults.updateData,
          updateDataTitle: analysisResults.updateDataTitle,
          updateDataDescription: analysisResults.updateDataDescription,
          updateDataStatus: analysisResults.updateDataStatus,
          addDataSuccess: analysisResults.addDataSuccess,
          fetchData: analysisResults.fetchData,
          getDataVersions: analysisResults.getDataVersions,
          updateDataVersions: analysisResults.updateDataVersions,
          getBackendVersion: analysisResults.getBackendVersion,
          getFrontendVersion: analysisResults.getFrontendVersion,
          getTimestamp: analysisResults.getTimestamp,
          getStores: analysisResults.getStores,
          getInitialState: analysisResults.getInitialState,
          getConfigOption: analysisResults.getConfigOption,
          dataItems: analysisResults.dataItems,
          newData: analysisResults.newData,
          getAllKeys: analysisResults.getAllKeys,
          getAllItems: analysisResults.getAllItems,

          // Utility and Helper Methods
          transformSubscriber: analysisResults.transformSubscriber,
          transformDelegate: analysisResults.transformDelegate,
          deepCompare: analysisResults.deepCompare,
          shallowCompare: analysisResults.shallowCompare,
          getDelegate: analysisResults.getDelegate,
          determineCategory: analysisResults.determineCategory,
          determinePrefix: analysisResults.determinePrefix,
          emit: analysisResults.emit,

          parentId: analysisResults.parentId,
          childIds: analysisResults.childIds,
          getParentId: analysisResults.getParentId,
          getChildIds: analysisResults.getChildIds,
          addChild: analysisResults.addChild,
          removeChild: analysisResults.removeChild,
          getChildren: analysisResults.getChildren,
          hasChildren: analysisResults.hasChildren,
          isDescendantOf: analysisResults.isDescendantOf,
          mappedSnapshotData: analysisResults.mappedSnapshotData,

          // Snapshot Actions
          executeSnapshotAction: analysisResults.executeSnapshotAction,
          subscribeToSnapshotsSuccess: analysisResults.subscribeToSnapshotsSuccess,
          getSnapshotItemsSuccess: analysisResults.getSnapshotItemsSuccess,
          getSnapshotItemSuccess: analysisResults.getSnapshotItemSuccess,
          getSnapshotKeys: analysisResults.getSnapshotKeys,
          getSnapshotIdSuccess: analysisResults.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: analysisResults.getSnapshotValuesSuccess,
          reduceSnapshotItems: analysisResults.reduceSnapshotItems,

          filterSnapshotsByStatus: analysisResults.filterSnapshotsByStatus,
          filterSnapshotsByCategory: analysisResults.filterSnapshotsByCategory,
          filterSnapshotsByTag: analysisResults.filterSnapshotsByTag,

          // Data Storage
          getStore: analysisResults.getStore,
          addStore: analysisResults.addStore,
          mapSnapshot: analysisResults.mapSnapshot,
          mapSnapshotWithDetails: analysisResults.mapSnapshotWithDetails,

          // Initialization and State Management
          getState: analysisResults.getState,
          setState: analysisResults.setState,
          initSnapshot: analysisResults.initSnapshot,
          validateSnapshot: analysisResults.validateSnapshot,
          handleActions: analysisResults.handleActions,
          createSnapshots: analysisResults.createSnapshots,
          onSnapshot: analysisResults.onSnapshot,
          onSnapshots: analysisResults.onSnapshots,
          setSnapshot: analysisResults.setSnapshot,
          setSnapshotCategory: analysisResults.setSnapshotCategory,
          getSnapshotCategory: analysisResults.getSnapshotCategory,

          setCategory: analysisResults.setCategory,
          applyStoreConfig: analysisResults.applyStoreConfig,
          versionInfo: analysisResults.versionInfo,
          initializedState: analysisResults.initializedState,
          isCore: analysisResults.isCore,
          taskIdToAssign: analysisResults.taskIdToAssign,
          generateId: analysisResults.generateId,
          getAllValues: analysisResults.getAllValues,
          getSnapshotEntries: analysisResults.getSnapshotEntries,
          getAllSnapshotEntries: analysisResults.getAllSnapshotEntries,

          removeItem: analysisResults.removeItem,
          getSnapshotSuccess: analysisResults.getSnapshotSuccess,
          setItem: analysisResults.setItem,

          getItem: analysisResults.getItem,
          addSnapshotSuccess: analysisResults.addSnapshotSuccess,
          addSnapshotItem: analysisResults.addSnapshotItem,

          addSnapshot: analysisResults.addSnapshot,
          createInitSnapshot: analysisResults.createInitSnapshot,
          getSnapshotListByCriteria: analysisResults.getSnapshotListByCriteria,
          setSnapshotSuccess: analysisResults.setSnapshotSuccess,
          setSnapshotFailure: analysisResults.setSnapshotFailure,

          takeSnapshotsSuccess: analysisResults.takeSnapshotsSuccess,
          flatMap: analysisResults.flatMap,
          transformSnapshotConfig: analysisResults.transformSnapshotConfig,
          mapSnapshots: analysisResults.mapSnapshots,
          updateSnapshot: analysisResults.updateSnapshot,

          items: analysisResults.items,
          getSnapshotById: analysisResults.getSnapshotById,
          
          subscribers: analysisResults.subscribers,

          batchTakeSnapshotsRequest: analysisResults.batchTakeSnapshotsRequest,

          compareSnapshotState: analysisResults.compareSnapshotState,
          getData: analysisResults.getData,
          setData: analysisResults.setData,
          addData: analysisResults.addData,
          stores: analysisResults.stores,

          unsubscribe: analysisResults.unsubscribe,
          fetchSnapshot: analysisResults.fetchSnapshot,
          addSnapshotFailure: analysisResults.addSnapshotFailure,

          currentCategory: analysisResults.currentCategory,
          fetchStoreData: analysisResults.snapshotStores[0].getStoreData,
          snapshotMethods: analysisResults.snapshotStores[0].snapshotMethods,
          getSnapshotsBySubscriber: analysisResults.snapshotStores[0].getSnapshotsBySubscriber,
          isSubscribed: analysisResults.snapshotStores[0].isSubscribed,
          
          clearSnapshotSuccess: analysisResults.snapshotStores[0].clearSnapshotSuccess,
          addToSnapshotList: analysisResults.snapshotStores[0].addToSnapshotList,
          getSnapshotsBySubscriberSuccess: analysisResults.snapshotStores[0].getSnapshotsBySubscriberSuccess,
          isExpired: analysisResults.snapshotStores[0].isExpired,
          find: analysisResults.snapshotStores[0].find,
          handleSnapshotFailure: analysisResults.snapshotStores[0].handleSnapshotFailure,
          initializeWithData: analysisResults.snapshotStores[0].initializeWithData,
          hasSnapshots: analysisResults.snapshotStores[0].hasSnapshots,
          equals: analysisResults.snapshotStores[0].equals
        })
    } else {
      // Handle YourResponseType case if different processing is required
      return Promise.reject(new Error("Unexpected response format"));
    }
  })
  .catch((error) => {
    handleDataAnalysisApiErrorAndNotify(
      error as AxiosError<unknown>,
      NOTIFICATION_MESSAGES.errorMessage.FETCH_ANALYSIS_RESULTS_ERROR,
      "FETCH_ANALYSIS_RESULTS_ERROR"
    );
    return Promise.reject(error);
  });
};

// Function to check if an object conforms to DataAnalysisResult interface
const isDataAnalysisResult = (obj: any): obj is DataAnalysisResult<T> => {
  return (
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.title === "string" &&
    Array.isArray(obj.insights) &&
    obj.analysisType !== undefined &&
    obj.analysisDate instanceof Date &&
    Array.isArray(obj.results) &&
    typeof obj.result === "number" &&
    typeof obj.description === "string" &&
    typeof obj.status === "string" &&
    obj.createdAt instanceof Date &&
    (obj.updatedAt === undefined || obj.updatedAt instanceof Date) &&
    Array.isArray(obj.recommendations) &&
    typeof obj.sentimentAnalysis === "boolean" &&
    typeof obj.metrics === "object" &&
    typeof obj.visualizations === "object" &&
    typeof obj.communityImpact === "boolean" &&
    typeof obj.globalCollaboration === "boolean" &&
    typeof obj.solutionQuality === "boolean" &&
    typeof obj.unityPromotion === "boolean" &&
    typeof obj.humanityBenefit === "boolean" &&
    typeof obj.conclusions === "string" &&
    Array.isArray(obj.futureSteps)
    // Add more checks for additional properties if necessary
  );
};


export const fetchSentimentAnalysisResults = (text: string): Promise<string> => {
  const endpoint = getEndpoint();

  return fetchDataAnalysis(endpoint, text) // Pass text directly
    .then((result: any) => result.sentiment)
    .catch((error: any) => {
      console.error("Error performing sentiment analysis:", error);
      return "Unknown"; // Return 'Unknown' sentiment in case of error
    });
};



export const storeAnalyticsData = async (analyticsData: any): Promise<void> => {
  try {
    // Attempt to store analytics data in local storage
    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
    console.log('Analytics data stored in local storage:', analyticsData);
  } catch (localStorageError) {
    console.error('Failed to store analytics data in local storage:', localStorageError);

    try {
      // If storing in local storage fails or if it's not available, send to backend
      await sendAnalyticsDataToBackend(analyticsData);
    } catch (backendError) {
      console.error('Failed to send analytics data to backend:', backendError);
      // Handle the error using the API error handler and notify
      handleDataAnalysisApiErrorAndNotify(
        backendError as AxiosError<unknown>,
        'Failed to store analytics data',
        'FETCH_ANALYSIS_RESULTS_ERROR' // Example error message key from dataAnalysisNotificationMessages
      );
      throw new Error('Failed to store analytics data');
    }
  }
};

export const sendAnalyticsDataToBackend = async (analyticsData: any): Promise<void> => {
  try {
    const response = await axiosInstance.post('/analytics', analyticsData);
    console.log('Analytics data sent to backend successfully:', response.data);
  } catch (error) {
    console.error('Failed to send analytics data to backend:', error);
    throw new Error('Failed to send analytics data to backend');
  }
};