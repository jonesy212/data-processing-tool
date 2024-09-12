// ApiDataAnalysis.ts
import {
  NotificationType,
  useNotification
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { BaseData, Data } from "../components/models/data/Data";
import { PriorityTypeEnum } from "../components/models/data/StatusType";
import { DataAnalysisResult } from "../components/projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
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

// Function to fetch data analysis
export function fetchDataAnalysis(
  endpoint: string,
  text?: string
): Promise<YourResponseType | Snapshot<Data>> {
  const fetchDataAnalysisEndpoint = `${DATA_ANALYSIS_BASE_URL}${endpoint}`;
  const config = {
    headers: headersConfig,
    params: text ? { text } : undefined, // Add text as params if provided
  };

  return axiosInstance
    .get<YourResponseType | Snapshot<Data>>(fetchDataAnalysisEndpoint, config)
    .then((response) => response.data as Snapshot<Data>)
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
export const fetchAnalysisResults = (): Promise<any> => {
  const endpoint = DATA_ANALYSIS_BASE_URL.getAnalysisResults;

  if (typeof endpoint !== "string") {
    return Promise.reject(new Error("Endpoint is not a string"));
  }

  return fetchDataAnalysis(endpoint)
    .then((response: YourResponseType | Snapshot<Data, Data>) => {
      const analysisResults = response.data;

      // Check if analysisResults is of type DataAnalysisResult
      if (!isDataAnalysisResult(analysisResults)) {
        return Promise.reject(new Error("Invalid response data"));
      }

      // Destructure analysisResults safely
      const { description, phase, priority, sentiment, sentimentAnalysis, ...rest } = analysisResults;

      // Return processed data
      return {
        // General Properties
        ...rest,
        description: description ?? undefined,
        phase: phase ?? undefined,
        priority: priority as PriorityTypeEnum | undefined,

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

      } as Snapshot<BaseData, BaseData>
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
const isDataAnalysisResult = (obj: any): obj is DataAnalysisResult => {
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