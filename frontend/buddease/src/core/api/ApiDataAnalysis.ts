// ApiDataAnalysis.ts
import internalApiService from "@/core/api/ApiClient";
import { handleApiError } from '@/core/api/ApiLogs';
import { endpoints } from "@/core/api/endpointConfigurations";
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { NotificationPosition, PriorityTypeEnum } from '@/core/models/data/StatusType';
import { DataAnalysisResult } from "@/core/projects/DataAnalysisPhase/DataAnalysisResult";
import { convertResponseToSnapshot } from "@/core/snapshots/InitializedSnapshotTypes";
import type { Snapshot } from "@/core/snapshots/Snapshot";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { InitializedSnapshot } from "@/core/snapshots/SnapshotStoreOptions";
import { data } from '@/core/snapshots/SnapshotWithCriteria';
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import { useNotification } from '@/core/state/context/NotificationContext';

import { isSnapshotStore, isYourResponseType } from "@/core/typings/YourSpecificSnapshotType";
import { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta } from '@/core/typings/entities/DataEntity';
import { YourResponseType } from '@/core/typings/responseTypes';
import { isSnapshot } from "@/utils/snapshotUtils";
import { AxiosError, AxiosResponse } from "axios";
import { useDispatch } from "react-redux";

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

    useNotification().notify({
      id: `data-analysis-${String(errorMessageId)}`, // unique string id
      message: errorMessageText,                     // content
      data: { originalError: errorMessage },        // structured data payload
      timestamp: new Date(),                         // when it occurred
      type: NotificationTypeEnum.API_ERROR,         // notification type
      position: NotificationPosition.TopRight       // optional: can customize
      // You can add `persistent` or `action` if needed
    });
  }
};


export function fetchDataAnalysis<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  endpoint: string,
  text?: string
): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  const fetchDataAnalysisEndpoint = `${DATA_ANALYSIS_BASE_URL}${endpoint}`;
  const config = {
    headers: headersConfig,
    params: text ? { text } : undefined,
  };

  return internalApiService
  .get<InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    fetchDataAnalysisEndpoint, 
    config
  )
  .then((response: AxiosResponse<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    const result = convertResponseToSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(response.data);
    
    // Explicit type narrowing
    if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(result)) {
      return result as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    } else if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(result)) {
      return result as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    } else if (isYourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(result)) {
      return result as YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }
    
    throw new Error("Unexpected response type");
  })
  .catch((error) => {
    console.error("Error fetching data analysis:", error);
    const errorMessage = "Failed to fetch data analysis";
    handleDataAnalysisApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FETCH_ANALYSIS_RESULTS_ERROR"
    );
    throw error;
  });
}



// Helper type guard for InitializedSnapshot
function isInitializedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): snapshot is InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (snapshot as InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>).isInitialized === true;
}



// Function to fetch analysis results
export const fetchAnalysisResults = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const endpoint = DATA_ANALYSIS_BASE_URL.getAnalysisResults;

  if (typeof endpoint !== "string") {
    return Promise.reject(new Error("Endpoint is not a string"));
  }

  return fetchDataAnalysis<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(endpoint)
    .then((response) => {
      if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(response)) {
        // Handle SnapshotStore case
        const snapshotStore = response;
        
        return createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
          ...rest,
          status: snapshotStore.status,
          // Core Data
          dataObject: snapshotStore.dataObject,
          deleted: snapshotStore.deleted,
          createdBy: snapshotStore.createdBy,
          mappedSnapshot: snapshotStore.mappedSnapshot,

          // Subscription Management
          manageSubscription: snapshotStore.manageSubscription,
          keys: snapshotStore.keys,
          options: snapshotStore.options,
          structuredMetadata: snapshotStore.structuredMetadata,

          // Snapshot Retrieval
          get: snapshotStore.get,
          maxAge: snapshotStore.maxAge,
          getSnapshotsByTopic: snapshotStore.getSnapshotsByTopic,
          getSnapshotsByTopicSuccess: snapshotStore.getSnapshotsByTopicSuccess,
          getSnapshotsByCategory: snapshotStore.getSnapshotsByCategory,
          getSnapshotsByCategorySuccess: snapshotStore.getSnapshotsByCategorySuccess,
          getSnapshotsByKey: snapshotStore.getSnapshotsByKey,
          getSnapshotsByKeySuccess: snapshotStore.getSnapshotsByKeySuccess,
          getSnapshotsByPriority: snapshotStore.getSnapshotsByPriority,
          getSnapshotsByPrioritySuccess: snapshotStore.getSnapshotsByPrioritySuccess,

          // Store Data Management
          getStoreData: snapshotStore.getStoreData,
          updateStoreData: snapshotStore.updateStoreData,
          snapshotStores: snapshotStoresMap ?? new Map(),
          updateDelegate: snapshotStore.updateDelegate,

          autoSyncData: snapshotStore.autoSyncData,
          endpointCategory: snapshotStore.endpointCategory,
          findIndex: snapshotStore.findIndex,
          
          splice: snapshotStore.splice,
          getSnapshotStoreData: snapshotStore.getSnapshotStoreData,
          // Snapshot Operations
          getSnapshotContainer: snapshotStore.getSnapshotContainer,
          getSnapshotVersions: snapshotStore.getSnapshotVersions,
          getEventsAsRecord: snapshotStore.getEventsAsRecord,
          addSnapshotToStore: snapshotStore.addSnapshotToStore,
          updateSnapshotStore: snapshotStore.updateSnapshotStore,

          // Data Transformation
          mapDataStore: snapshotStore?.mapDataStore,
          transformInitialState: snapshotStore.getTransformedInitialState,
          transformSnapshot: snapshotStore.getTransformedSnapshot,
          transformMappedSnapshotData: snapshotStore.transformMappedSnapshotData,
          transformSnapshotStore: snapshotStore.transformSnapshotStore,
          transformSnapshotMethod: snapshotStore.transformSnapshotMethod,

          // Store and Config Initialization
          initializeOptions: snapshotStore.initializeOptions,
          setConfig: snapshotStore.setConfig,
          initializeStores: snapshotStore.initializeStores,
          initializeDefaultConfigs: snapshotStore.initializeDefaultConfigs,

          // Notifications and Error Handling
          notifySuccess: snapshotStore.notifySuccess,
          notifyFailure: snapshotStore.notifyFailure,
          clearSnapshotFailure: snapshotStore.clearSnapshotFailure,

          // Snapshot Store CRUD
          findSnapshotStoreById: snapshotStore.findSnapshotStoreById,
          getSnapshotStores: snapshotStore.getSnapshotStores,
          defaultSaveSnapshotStore: snapshotStore.defaultSaveSnapshotStore,
          saveSnapshotStore: snapshotStore.saveSnapshotStore,
          _saveSnapshotStores: snapshotStore._saveSnapshotStores,
          _saveSnapshotStore: snapshotStore._saveSnapshotStore,
          defaultSaveSnapshotStores: snapshotStore.defaultSaveSnapshotStores,

          // Delegate and Subscriptions
          ensureDelegate: snapshotStore.ensureDelegate,
          getFirstDelegate: snapshotStore.getInitialDelegate,
          getInitialDelegate: snapshotStore.getInitialDelegate,
          transformedDelegate: snapshotStore.transformedDelegate,

          // Metadata and Configuration
          consolidateMetadata: snapshotStore.compress,
          getMetadata: snapshotStore.getMetadata,
          getProjectMetadata: snapshotStore.getProjectMetadata,
          getStructuredMetadata: snapshotStore.getStructuredMetadata,
          getSnapshotStoreConfig: snapshotStore.getSnapshotStoreConfig,
          defaultConfigs: snapshotStore.initializeDefaultConfigs(),
          storeProps: snapshotStore.storeProps,
          callback: snapshotStore.callback,

          // Store Utilities
          getConfig: snapshotStore.getConfig,
          getName: snapshotStore.getName,
          getVersion: snapshotStore.getVersion,
          getSchema: snapshotStore.getSchema,

          // Data Store Handling
          dataStores: snapshotStore.dataStores,
          safeCastSnapshotStore: snapshotStore.safeCastSnapshotStore,
          getItems: snapshotStore.getItems,
          handleDelegate: snapshotStore.handleDelegate,

          // Mapped Data
          defaultCreateSnapshotStores: snapshotStore.defaultCreateSnapshotStores,
          createSnapshotStores: snapshotStore.createSnapshotStores,
          defaultOnSnapshots: snapshotStore.defaultOnSnapshots,
          filterInvalidSnapshots: snapshotStore.filterInvalidSnapshots,
          mapSnapshotsAO: snapshotStore.mapSnapshotsAO,

          // Snapshot Analysis
          getSnapshotIds: snapshotStore.getSnapshotIds,
          getSnapshotArray: snapshotStore.getSnapshotArray,
          getSavedSnapshotStore: snapshotStore.getSavedSnapshotStore,
          getSavedSnapshotStores: snapshotStore.getSavedSnapshotStores,
          getConfigs: snapshotStore.getConfigs,

          // Miscellaneous
          isCompatibleSnapshot: snapshotStore.isCompatibleSnapshot,
          isSnapshotStoreConfig: snapshotStore.isSnapshotStoreConfig,
          transformedSubscriber: snapshotStore.transformedSubscriber,
          isMobile: snapshotStore.isMobile,
          browserType: snapshotStore.browserType,

          // Snapshot Store Operations
          getTransformedSnapshot: snapshotStore.getTransformedSnapshot,
          getTransformedInitialState: snapshotStore.getTransformedInitialState,
          getFindSnapshotStoreById: snapshotStore.getFindSnapshotStoreById,
          determineSnapshotStoreCategory: snapshotStore.determineSnapshotStoreCategory,
          getNestedStores: snapshotStore.getNestedStores,

          // Snapshot and Store Payload
          getPayload: snapshotStore.getPayload,
          setPayload: snapshotStore.setPayload,
          getCallback: snapshotStore.getCallback,
          setCallback: snapshotStore.setCallback,
          getStoreProps: snapshotStore.getStoreProps,
          setStoreProps: snapshotStore.setStoreProps,
          getEndpointCategory: snapshotStore.getEndpointCategory,
          setEndpointCategory: snapshotStore.setEndpointCategory,

          // Security and Auditing
          auditRecords: snapshotStore.auditRecords,
          encrypt: snapshotStore.encrypt,
          decrypt: snapshotStore.decrypt,
          compress: snapshotStore.compress,

          // Temporary Data
          storeTempData: snapshotStore.storeTempData,
          getTempData: snapshotStore.getTempData,

          // Debugging
          addDebugInfo: snapshotStore.addDebugInfo,

          // Iterable support
          [Symbol.iterator]: data?.[Symbol.iterator] || function* () {},



          description: snapshotStore.description ?? undefined,
          phase: snapshotStore.phase ?? undefined,
          priority: snapshotStore.priority as PriorityTypeEnum | undefined,

          schema: snapshotStore.getSchema(),
          storeId: snapshotStore.storeId,
          criteria: snapshotStore.criteria,
          snapshotContainer: snapshotStore.getSnapshotContainer(),
          
          snapConfig: snapshotStore.snapConfig,
          snapshotCategory: snapshotStore.snapshotCategory,
          snapshotSubscriberId: snapshotStore.snapshotSubscriberId,
          initialState: snapshotStore.initialState,
          timestamp: snapshotStore.timestamp,
          label: snapshotStore.label,
          


          // Data Analysis
          data: snapshotStore.data,
          sentiment: snapshotStore.sentiment,
          sentimentAnalysis: snapshotStore.sentimentAnalysis,
          events: snapshotStore.events,
          meta: snapshotStore.meta,
          initialConfig: snapshotStore.initialConfig,
          config: snapshotStore.config,

          // Snapshot Management
          snapshot: snapshotStore.snapshot,
          payload: snapshotStore.payload,
          snapshotData: snapshotStore.snapshotData,
          getSnapshotItems: snapshotStore.getSnapshotItems,
          getSnapshot: snapshotStore.getSnapshot,
          getAllSnapshots: snapshotStore.getAllSnapshots,
          takeSnapshot: snapshotStore.takeSnapshot,
          createSnapshot: snapshotStore.createSnapshot,
          updateSnapshots: snapshotStore.updateSnapshots,
          deleteSnapshot: snapshotStore.deleteSnapshot,
          batchTakeSnapshot: snapshotStore.batchTakeSnapshot,
          batchFetchSnapshots: snapshotStore.batchFetchSnapshots,
          batchUpdateSnapshotsRequest: snapshotStore.batchUpdateSnapshotsRequest,
          batchFetchSnapshotsSuccess: snapshotStore.batchFetchSnapshotsSuccess,
          batchUpdateSnapshotsSuccess: snapshotStore.batchUpdateSnapshotsSuccess,
          batchFetchSnapshotsFailure: snapshotStore.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsFailure: snapshotStore.batchUpdateSnapshotsFailure,
          takeSnapshotSuccess: snapshotStore.takeSnapshotSuccess,
          createSnapshotSuccess: snapshotStore.createSnapshotSuccess,
          createSnapshotFailure: snapshotStore.createSnapshotFailure,
          updateSnapshotSuccess: snapshotStore.updateSnapshotSuccess,
          updateSnapshotFailure: snapshotStore.updateSnapshotFailure,
          updateSnapshotsSuccess: snapshotStore.updateSnapshotsSuccess,
          updateSnapshotsFailure: snapshotStore.updateSnapshotsFailure,
          fetchSnapshotSuccess: snapshotStore.fetchSnapshotSuccess,
          fetchSnapshotFailure: snapshotStore.updateSnapshotFailure,
          getSnapshots: snapshotStore.getSnapshots,
          getSnapshotId: snapshotStore.getSnapshotId,
          getSnapshotWithCriteria: snapshotStore.getSnapshotWithCriteria,
          getSnapshotConfigItems: snapshotStore.getSnapshotConfigItems,
          compareSnapshots: snapshotStore.compareSnapshots,
          compareSnapshotItems: snapshotStore.compareSnapshotItems,
          mergeSnapshots: snapshotStore.mergeSnapshots,
          reduceSnapshots: snapshotStore.reduceSnapshots,
          sortSnapshots: snapshotStore.sortSnapshots,
          filterSnapshots: snapshotStore.filterSnapshots,
          findSnapshot: snapshotStore.findSnapshot,
          takeLatestSnapshot: snapshotStore.takeLatestSnapshot,
          restoreSnapshot: snapshotStore.restoreSnapshot,
          clearSnapshots: snapshotStore.clearSnapshots,
          setSnapshots: snapshotStore.setSnapshots,
          clearSnapshot: snapshotStore.clearSnapshot,
          handleSnapshot: snapshotStore.handleSnapshot,
          handleSnapshotSuccess: snapshotStore.handleSnapshotSuccess,
          getSnapshotData: snapshotStore.getSnapshotData,

          // Snapshot Store Management
          snapshotStore: snapshotStore.snapshotStore,
          configureSnapshotStore: snapshotStore.configureSnapshotStore,
          getDataStore: snapshotStore.getDataStore,
          addStoreConfig: snapshotStore.addStoreConfig,
          getSnapshotConfig: snapshotStore.getSnapshotConfig,
          handleSnapshotConfig: snapshotStore.handleSnapshotConfig,
          getDataStoreMethods: snapshotStore.getDataStoreMethods,
          addNestedStore: snapshotStore.addNestedStore,
          removeStore: snapshotStore.removeStore,

          removeSnapshot: snapshotStore.removeSnapshot,
          getDataStoreMap: snapshotStore.getDataStoreMap,

          // Subscriber Management
          subscribe: snapshotStore.subscribe,
          removeSubscriber: snapshotStore.removeSubscriber,
          onInitialize: snapshotStore.onInitialize,
          onError: snapshotStore.onError,
          defaultSubscribeToSnapshots: snapshotStore.defaultSubscribeToSnapshots,
          defaultSubscribeToSnapshot: snapshotStore.defaultSubscribeToSnapshot,
          subscribeToSnapshots: snapshotStore.subscribeToSnapshots,
          handleSubscribeToSnapshot: snapshotStore.handleSubscribeToSnapshot,
          unsubscribeFromSnapshot: snapshotStore.unsubscribeFromSnapshot,
          subscribeToSnapshot: snapshotStore.subscribeToSnapshot,
          notify: snapshotStore.notify,
          notifySubscribers: snapshotStore.notifySubscribers,
          getSubscribers: snapshotStore.getSubscribers,
          addSnapshotSubscriber: snapshotStore.addSnapshotSubscriber,
          removeSnapshotSubscriber: snapshotStore.removeSnapshotSubscriber,
          subscribeToSnapshotList: snapshotStore.subscribeToSnapshotList,
          unsubscribeFromSnapshots: snapshotStore.unsubscribeFromSnapshots,

          // Data Operations
          addDataStatus: snapshotStore.addDataStatus,
          removeData: snapshotStore.removeData,
          updateData: snapshotStore.updateData,
          updateDataTitle: snapshotStore.updateDataTitle,
          updateDataDescription: snapshotStore.updateDataDescription,
          updateDataStatus: snapshotStore.updateDataStatus,
          addDataSuccess: snapshotStore.addDataSuccess,
          fetchData: snapshotStore.fetchData,
          getDataVersions: snapshotStore.getDataVersions,
          updateDataVersions: snapshotStore.updateDataVersions,
          getBackendVersion: snapshotStore.getBackendVersion,
          getFrontendVersion: snapshotStore.getFrontendVersion,
          getTimestamp: snapshotStore.getTimestamp,
          getStores: snapshotStore.getStores,
          getInitialState: snapshotStore.getInitialState,
          getConfigOption: snapshotStore.getConfigOption,
          dataItems: snapshotStore.dataItems,
          newData: snapshotStore.newData,
          getAllKeys: snapshotStore.getAllKeys,
          getAllItems: snapshotStore.getAllItems,

          // Utility and Helper Methods
          transformSubscriber: snapshotStore.transformSubscriber,
          transformDelegate: snapshotStore.transformDelegate,
          deepCompare: snapshotStore.deepCompare,
          shallowCompare: snapshotStore.shallowCompare,
          getDelegate: snapshotStore.getDelegate,
          determineCategory: snapshotStore.determineCategory,
          determinePrefix: snapshotStore.determinePrefix,
          emit: snapshotStore.emit,

          parentId: snapshotStore.parentId,
          childIds: snapshotStore.childIds,
          getParentId: snapshotStore.getParentId,
          getChildIds: snapshotStore.getChildIds,
          addChild: snapshotStore.addChild,
          removeChild: snapshotStore.removeChild,
          getChildren: snapshotStore.getChildren,
          hasChildren: snapshotStore.hasChildren,
          isDescendantOf: snapshotStore.isDescendantOf,
          mappedSnapshotData: snapshotStore.mappedSnapshotData,

          // Snapshot Actions
          executeSnapshotAction: snapshotStore.executeSnapshotAction,
          subscribeToSnapshotsSuccess: snapshotStore.subscribeToSnapshotsSuccess,
          getSnapshotItemsSuccess: snapshotStore.getSnapshotItemsSuccess,
          getSnapshotItemSuccess: snapshotStore.getSnapshotItemSuccess,
          getSnapshotKeys: snapshotStore.getSnapshotKeys,
          getSnapshotIdSuccess: snapshotStore.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: snapshotStore.getSnapshotValuesSuccess,
          reduceSnapshotItems: snapshotStore.reduceSnapshotItems,

          filterSnapshotsByStatus: snapshotStore.filterSnapshotsByStatus,
          filterSnapshotsByCategory: snapshotStore.filterSnapshotsByCategory,
          filterSnapshotsByTag: snapshotStore.filterSnapshotsByTag,

          // Data Storage
          getStore: snapshotStore.getStore,
          addStore: snapshotStore.addStore,
          mapSnapshot: snapshotStore.mapSnapshot,
          mapSnapshotWithDetails: snapshotStore.mapSnapshotWithDetails,

          // Initialization and State Management
          getState: snapshotStore.getState,
          setState: snapshotStore.setState,
          initSnapshot: snapshotStore.initSnapshot,
          validateSnapshot: snapshotStore.validateSnapshot,
          handleActions: snapshotStore.handleActions,
          createSnapshots: snapshotStore.createSnapshots,
          onSnapshot: snapshotStore.onSnapshot,
          onSnapshots: snapshotStore.onSnapshots,
          setSnapshot: snapshotStore.setSnapshot,
          setSnapshotCategory: snapshotStore.setSnapshotCategory,
          getSnapshotCategory: snapshotStore.getSnapshotCategory,

          setCategory: snapshotStore.setCategory,
          applyStoreConfig: snapshotStore.applyStoreConfig,
          versionInfo: snapshotStore.versionInfo,
          initializedState: snapshotStore.initializedState,
          isCore: snapshotStore.isCore,
          taskIdToAssign: snapshotStore.taskIdToAssign,
          generateId: snapshotStore.generateId,
          getAllValues: snapshotStore.getAllValues,
          getSnapshotEntries: snapshotStore.getSnapshotEntries,
          getAllSnapshotEntries: snapshotStore.getAllSnapshotEntries,

          removeItem: snapshotStore.removeItem,
          getSnapshotSuccess: snapshotStore.getSnapshotSuccess,
          setItem: snapshotStore.setItem,

          getItem: snapshotStore.getItem,
          addSnapshotSuccess: snapshotStore.addSnapshotSuccess,
          addSnapshotItem: snapshotStore.addSnapshotItem,

          addSnapshot: snapshotStore.addSnapshot,
          createInitSnapshot: snapshotStore.createInitSnapshot,
          getSnapshotListByCriteria: snapshotStore.getSnapshotListByCriteria,
          setSnapshotSuccess: snapshotStore.setSnapshotSuccess,
          setSnapshotFailure: snapshotStore.setSnapshotFailure,

          takeSnapshotsSuccess: snapshotStore.takeSnapshotsSuccess,
          flatMap: snapshotStore.flatMap,
          transformSnapshotConfig: snapshotStore.transformSnapshotConfig,
          mapSnapshots: snapshotStore.mapSnapshots,
          updateSnapshot: snapshotStore.updateSnapshot,

          items: snapshotStore.items,
          getSnapshotById: snapshotStore.getSnapshotById,
          
          subscribers: snapshotStore.subscribers,

          batchTakeSnapshotsRequest: snapshotStore.batchTakeSnapshotsRequest,

          compareSnapshotState: snapshotStore.compareSnapshotState,
          getData: snapshotStore.getData,
          setData: snapshotStore.setData,
          addData: snapshotStore.addData,
          stores: snapshotStore.stores,

          unsubscribe: snapshotStore.unsubscribe,
          fetchSnapshot: snapshotStore.fetchSnapshot,
          addSnapshotFailure: snapshotStore.addSnapshotFailure,

          currentCategory: snapshotStore.currentCategory,
          fetchStoreData: snapshotStore.getStoreData,
          snapshotMethods: snapshotStore.snapshotMethods,
          getSnapshotsBySubscriber: snapshotStore.getSnapshotsBySubscriber,
          isSubscribed: snapshotStore.isSubscribed,
          
          clearSnapshotSuccess: snapshotStore.clearSnapshotSuccess,
          addToSnapshotList: snapshotStore.addToSnapshotList,
          getSnapshotsBySubscriberSuccess: snapshotStore.getSnapshotsBySubscriberSuccess,
          isExpired: snapshotStore.isExpired,
          find: snapshotStore.find,
          handleSnapshotFailure: snapshotStore.handleSnapshotFailure,
          initializeWithData: snapshotStore.initializeWithData,
          hasSnapshots: snapshotStore.hasSnapshots,
          equals: snapshotStore.equals
        })
      } else if ("data" in response && response.data) {
        // Handle YourResponseType case
        const analysisResults = response.data;
        
        if (!isDataAnalysisResult(analysisResults)) {
          return Promise.reject(new Error("Invalid response data"));
        }
        const snapshotStore = snapshotStore;

        if (!snapshotStore?.[0]) {
          return Promise.reject(new Error("No snapshots available"));
        }

        return createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
          // Map properties from analysisResults and snapshotStore
          // Similar to above but using analysisResults where needed
        });
      } else {
        return Promise.reject(new Error("Unexpected response format"));
      }
    })
  .catch((error) => {
    handleDataAnalysisApiErrorAndNotify(
      error as AxiosError<unknown>,
      NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ANALYSIS_RESULTS_ERROR,
      "FETCH_ANALYSIS_RESULTS_ERROR"
    );
    return Promise.reject(error);
  });
};

// Function to check if an object conforms to DataAnalysisResult interface
const isDataAnalysisResult = (obj: any): obj is DataAnalysisResult<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> => {
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
    const response = await internalApiService.post('/analytics', analyticsData);
    console.log('Analytics data sent to backend successfully:', response.data);
  } catch (error) {
    console.error('Failed to send analytics data to backend:', error);
    throw new Error('Failed to send analytics data to backend');
  }
};


export { isInitializedSnapshot };
