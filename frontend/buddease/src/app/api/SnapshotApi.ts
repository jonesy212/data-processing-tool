// SnapshotApi.ts
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { BaseDataRoot } from '@/app/config/BaseConfig';
import { defaultCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotSubscriberManagement } from '@/app/snapshots/SnapshotSubscriberManagement';
import { getCategory } from '@/app/snapshots/snapshotContainerUtils';
import { AxiosError } from "axios";
import { useDispatch } from 'react-redux';

// Core models and types
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotContainer, SnapshotContainerData } from "@/app/snapshots/SnapshotContainer";
import SnapshotList from "@/app/snapshots/SnapshotList";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";

// API and HTTP related
import { handleApiError } from "@/app/api/ApiLogs";
import { searchAPI } from '@/app/api/ApiSearch';
import { constructTarget, Target } from "@/app/api/EndpointConstructor";
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import {
  AuthenticationHeaders,
  createAuthenticationHeaders,
} from "@/app/api/headers/authenticationHeaders";
import createCacheHeaders from "@/app/api/headers/cacheHeaders";
import createContentHeaders from "@/app/api/headers/contentHeaders";
import generateCustomHeaders from "@/app/api/headers/customHeaders";
import createRequestHeaders from "@/app/api/headers/requestHeaders";

// Utilities and hooks
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { subscriptionServiceInstance } from '@/app/hooks/dynamicHooks/dynamicHooks';
import { useErrorHandling } from "@/app/hooks/useErrorHandling";
import useSecureStoreId from '@/app/hooks/useSecureStoreId';
import { useSnapshotStore } from "@/app/snapshots/useSnapshotStore";

// Categories and data processing
import determineFileCategory from "@/app/libraries/categories/determineFileCategory";
import { processSnapshotsByCategory } from "@/app/libraries/categories/fileCategoryMapping";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { isValidFileCategory } from "@/app/snapshots/isValidFileCategory";

// Data store and methods
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { DataStore } from '@/app/state/stores/DataStore';

// Operations and config
import { UpdateSnapshotPayload } from '@/app/interfaces/payload/payloadTypes';
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { SnapshotDataType } from "@/app/snapshots/SnapshotContainer";
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';

// Subscribers and notifications
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/app/state/context/NotificationContext';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { Subscription } from '@/app/subscriptions/Subscription';

// Additional types
import { Content } from "@/app/models/content/AddContent";
import { BaseData } from '@/app/models/data/Data';
import { PriorityTypeEnum, ProjectStateEnum } from "@/app/models/data/StatusType";
import { Member } from '@/app/models/members/Member';
import { ProjectType } from '@/app/models/projects/Project';
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { FilterState } from "@/app/state/redux/slices/FilterSlice";
import { SnapshotEvent } from '@/app/typings/snapshotTypes';

// Config and metadata
import { AppConfig, getAppConfig } from "@/app/config/AppConfig";
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import configData from "@/app/config/endpoints/configData";

// Version management
import { createDefaultVersionData } from '@/app/versions/VersionData';
import { createLatestVersion } from '@/app/versions/createLatestVersion';

// Utils
import { isSnapshotFunction } from '@/app/snapshots/SnapshotMap';
import { addToSnapshotList, isSnapshot } from "@/utils/snapshotUtils";

import { CreateOptions, FetchAllOptions } from '@/app/snapshots/SnapshotOptions';

import {
  createMockSnapshot,
  getSnapshot,
  getSnapshots,
  removeSnapshot,
  takeSnapshot,
  updateSnapshot,
  validateSnapshot
} from '@/app/snapshots/snapshotOperations';


// Constants
const API_BASE_URL = endpoints.snapshots.list;
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


// Extending Snapshot to add optional properties (Extras) for specific contexts
type SnapshotWithExtras<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  Extras = {}
  > = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & Extras;


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

// handleSpecificApplicationLogic and handleOtherApplicationLogic functions
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

// const subscriptionServiceInstance = new SubscriptionService();

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
const apiCall = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  return new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
    try {
      const headers = createHeaders(additionalHeaders);
      const response = await axiosInstance({
        url,
        method,
        headers: headers as Record<string, string>,
        data
      });

      if (response.status === 200) {
        resolve(response.data as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
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


class SnapshotApi {
  // Core CRUD Operations
  getSnapshot = getSnapshot; // Reference to imported function
  getSnapshotCriteria = getSnapshotCriteria; // Reference to local function
  getSnapshotId = getSnapshotId; // Reference to local function
  getSnapshotStoreId = getSnapshotStoreId;
  fetchSnapshotById = fetchSnapshotById;
  addSnapshot = addSnapshot;
  saveSnapshotToDatabase = saveSnapshotToDatabase;
  takeSnapshot = takeSnapshot;
  
  async create<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: CreateOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return takeSnapshot(
      snapshot.content,
      new Date(),
      snapshot.projectType,
      snapshot.projectId,
      snapshot.projectState,
      snapshot.projectMembers
    );
  }

  async fetchById<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    id: string,
    storeId: number,
    additionalHeaders?: Record<string, string>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return getSnapshot(id, storeId, null as any, 'fetch', null as any, null as any, additionalHeaders);
  }

  async update<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: UpdateSnapshotPayload<Data<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    return updateSnapshot(
      snapshotId,
      snapshotId,
      data,
      newData,
      undefined,
      undefined,
      undefined,
      payload
    );
  }

  async delete<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    return removeSnapshot(snapshotToRemove);
  }

  // Batch Operations
  async fetchAll<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    options?: FetchAllOptions<T, K>
  ): Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Implementation using getSnapshots operation
    return getSnapshots(options?.criteria?.category || 'default', []);
  }

  // Utility Operations
  async validate<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<boolean> {
    return validateSnapshot(snapshot);
  }

  // Container Operations
  async getContainer<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    id: string | number,
    snapshotFetcher: (id: string | number) => Promise<any>
  ): Promise<any> {
    return getSnapshotContainer(id, snapshotFetcher);
  }

  // Mock data for development
  createMockSnapshot = createMockSnapshot;
}
// incorproate in to the above snapshotApi

function getSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string | number | null,
  additionalHeaders?: Record<string, string>
): Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
  return apiCall<T, K>(
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
          const firstKey = Array.from(response.data.keys())[0];
          categoryName = typeof firstKey === 'string' ? firstKey : undefined; 
        } else if (response.data && typeof response.data === 'object') {
          categoryName = (response.data as { category?: string }).category;
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

          // Ensure processedSnapshot conforms to Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(processedSnapshot)) {
            // Narrowing snapshotId to not include null here
            if (processedSnapshot.snapshotId !== null) {
              return processedSnapshot as SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
            } else {
              console.warn('Processed snapshot has null snapshotId', processedSnapshot);
              return undefined;
            }
          } else {
            console.warn('Processed snapshot is not a valid Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>', processedSnapshot);
            return undefined;
          }
        }
      }
      return undefined;
    })
    .catch((error) => {
      console.error('Error fetching snapshot data:', error);
      return undefined;
    }) as Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>
}


const findSubscriberById = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscriberId: string,
  endpointCategory: string | number,
  category?: Category,
): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
const postSnapshotToAPI = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  Extras = {}
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotExtras?: Extras
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

    // Combine snapshot with any extra properties
    const fullSnapshot = { ...snapshot, ...snapshotExtras } as SnapshotWithExtras<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields, Extras>;

    const response = await axiosInstance.post("/snapshots", fullSnapshot, {
      headers: headers as Record<string, string>,
    });

    if (response.status === 201) {
      console.log("Snapshot posted successfully:", response.data);
    } else {
      console.error("Failed to post snapshot. Status:", response.status);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to post snapshot to API");
    throw error;
  }
};

// Function to determine category from a Snapshot
const determineCategory = < 
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): string => {
  const category = snapshot.category; // Assuming 'category' is a property of Snapshot
  return typeof category === 'string' ? category : 'defaultCategory'; // Fallback to 'defaultCategory' if category is not a string
};

const getSnapshotsAndCategory = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  category?: Category,
  snapshotId: string,
  storeId: number, 
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  additionalHeaders?: Record<string, string>
): Promise<{ 
  snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 
  categoryProperties?: CategoryProperties; 
  cacheID: string 
}> => {
  const targetUrl = `${API_BASE_URL}?category=${String(category)}`;
  const headers = createHeaders(additionalHeaders);

  try {
    const response = await axiosInstance.get(targetUrl, { headers });
    const isValidSnapshotFunc = (entry: any): entry is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(entry);

    const snapshotsData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = response.data
      .filter(isValidSnapshotFunc)
      .map((entry: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => ({
        ...entry,
        filterSnapshotsByStatus: entry?.filterSnapshotsByStatus,
        filterSnapshotsByCategory: entry?.filterSnapshotsByCategory,
      }));
    // Get the category from the snapshot using determineCategory
    const categoryFromSnapshot = determineCategory(snapshot);

    // Generate the cache ID using category and snapshotId
    const cacheID = UniqueIDGenerator.generateIDForCache(categoryFromSnapshot, snapshotId);

    // Call getCategory with individual arguments
    const { categoryProperties = defaultCategoryProperties } = await getCategory(
      snapshotId, 
      storeId, 
      snapshot, 
      type, 
      event, 
      snapshotConfig, 
      additionalHeaders
    );

    // Use categoryProperties in the return object
    return {
      snapshots: snapshotsData,
      categoryProperties, 
      cacheID
    };
  } catch (error) {
    // Handle error fallback
    return {
      snapshots: [],
      categoryProperties: { 
        ...defaultCategoryProperties,
        id: 'error-id', 
        name: 'Error Category'
      },
      cacheID: `error-cache-${snapshotId}`
    };
  }
};



const findSnapshotsBySubscriber = async <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscriberId: string,
  endpointCategory: string | number,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category 
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {


  const target: Target = constructTarget(
    endpointCategory,
    `${endpoints.snapshots.list}?subscriberId=${subscriberId}&category=${String(category)}`
  );

  const headers: Record<string, any> = createRequestHeaders(String(target.url));

  if (!target.url) {
    throw new Error("Target URL is undefined");
  }

  try {

    // Construct base URL with optional query parameters
    const baseApiUrl = 'https://yourapi.example.com/api/snapshots';
    const url = new URL(baseApiUrl);
    const params = new URLSearchParams();

    // Add mandatory and optional parameters
    params.append('subscriberId', subscriberId);
    if (category) params.append('category', String(category));
    if (endpointCategory) params.append('endpointCategory', String(endpointCategory));
    url.search = params.toString();

    // Prepare headers (using axios headers if configured)
    const headers: Record<string, any> = snapshotConfig
      ? createRequestHeaders(String(url)) // Using function from your previous code if `snapshotConfig` is provided
      : { 'Content-Type': 'application/json' };

    const response = await axiosInstance.get(target.url, { headers });
    const snapshotsData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = response.data;

    const mapSnapshotEntryToSnapshot = (entry: any): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
      if (!entry || typeof entry !== 'object') return null;

      return {

        id: entry.id,
        data: entry.data,
        metadata: entry.metadata,
        initialState: entry.data as T,  // Provide default value or mapping
        isCore: true,  // Set default value if it's not available
        initialConfig: entry.initialConfig,

        keys: entry.keys,
        options: entry.options,
        structuredMetadata: entry.structuredMetadata,
        get: entry.get,
       

        isSubscribed: entry.isSubscribed,
        clearSnapshotSuccess: entry.clearSnapshotSuccess,
        addToSnapshotList: entry.addToSnapshotList,
        getSnapshotsBySubscriberSuccess: entry.getSnapshotsBySubscriberSuccess,
        isExpired: entry.isExpired,
        deleted: entry.deleted,
        criteria: entry.criteria,
        snapshotContainer: entry.snapshotContainer,
        snapshotCategory: entry.snapshotCategory,
        snapshotSubscriberId: entry.snapshotSubscriberId,

        hasSnapshots: entry.hasSnapshots ?? (() => false), // Default to a function that returns false if undefined
        initializeWithData: entry.initializeWithData ? entry.initializeWithData : () => { },

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
        find: entry.find,

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

        dataObject: entry.dataObject,
        createdBy: entry.createdBy,
        mappedSnapshot: entry.mappedSnapshot,
        manageSubscription: entry.manageSubscription,
        createdAt: entry.createdAt
      };
    }

    // Process the response data to create an array of Snapshots
    const snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshotsData.flatMap((snapshotData) => {
      if (!snapshotData) return [];

      if (snapshotData instanceof Map) {
        // If it's a Map, convert the entries to Snapshots
        return Array.from(snapshotData.values() as Iterable<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>)
          .map(mapSnapshotEntryToSnapshot)
          .filter(Boolean) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      }

      // For non-Map snapshotData, map it directly
      const mappedSnapshot = mapSnapshotEntryToSnapshot(snapshotData);
      return mappedSnapshot ? [mappedSnapshot] : [];
    });

    return snapshots; // Return the array of Snapshots
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


const addSnapshot = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  newSnapshot: Omit<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id">
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
    const response = await axiosInstance.post<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      "/snapshots",
      newSnapshot,
      { headers: headers as Record<string, string> }
    );

    if (response.status === 201) {
      const addedSnapshot = response.data;

      console.log("Snapshot added successfully:", addedSnapshot);

      // ✅ Notify with the properly typed Snapshot
      subscriptionServiceInstance.notify<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        "snapshotAdded",
        addedSnapshot
      );

      return addedSnapshot;
    } else {
      console.error("Failed to add snapshot. Status:", response.status);
      throw new Error(`Failed to add snapshot. Status: ${response.status}`);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to add snapshot");
    throw error;
  }
};



const addSnapshotSuccess = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  newSnapshot: Omit<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id">
) => {
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
    const response = await axiosInstance.post(`${API_BASE_URL}`, newSnapshot, {
      headers: headers as Record<string, string>,
    });

    if (response.status === 200) {
      const numericData = parseInt(response.data, 10);
      if (!isNaN(numericData)) {
        handleSpecificApplicationLogic(appConfig, numericData);
      } else {
        console.error("Response data is not a valid number:", response.data);
      }

      handleSpecificStatusCode(appConfig, response.status);
      handleOtherStatusCodes(appConfig, response.status);

      // Notify subscribers of successful snapshot addition
      subscriptionServiceInstance.notify("snapshotAdded", response.data);
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to add snapshot");
    throw error;
  }
};

const removeSnapshot = async (snapshotId: string | null): Promise<void> => {
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

    await axiosInstance.delete(`${API_BASE_URL}/${snapshotId}`, {
      headers: headers as Record<string, string>,
    });

    // Notify subscribers of successful snapshot removal
    subscriptionServiceInstance.notify("snapshotRemoved", { snapshotId });
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to remove snapshot");
    throw error;
  }
};

const saveSnapshotToDatabase = async (snapshotData: any): Promise<boolean> => {
  try {
    const saveSnapshotEndpoint = `${API_BASE_URL}/save`;
    await axiosInstance.post(saveSnapshotEndpoint, snapshotData, {
      headers: headersConfig,
    });

    useNotification().notify({
      id: "SaveSnapshotSuccessId",
      message: snapshotNotificationMessages.CREATE_SNAPSHOT_SUCCESS,
      data: {
        entityType: 'snapshot',
        extra: { snapshotData }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.SUCCESS,
      level: 'success' as const
    });

    // Notify subscribers of successful snapshot save
    subscriptionServiceInstance.notify("snapshotSaved", snapshotData);

    return true;
  } catch (error: any) {
    console.error("Error saving snapshot to database:", error);
    handleSnapshotApiError(error as AxiosError<unknown>, "Failed to save snapshot to database");

    return false;
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

interface SnapshotResponse {
  id: string;
  // Add other known properties
  [key: string]: any;
}

// Fetch snapshot by ID
const fetchSnapshotById = async (
  snapshotId: string
): Promise<SnapshotResponse | undefined> => {
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
      return response.data as SnapshotResponse;
    } else {
      throw new Error("Failed to fetch snapshot by ID");
    }
  } catch (error) {
    handleApiError(
      error as AxiosError<unknown>,
      "Failed to fetch snapshot by ID"
    );
    throw error;
  }
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

const fetchAllSnapshots = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
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

const fetchSnapshotStoreData = async  <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
    snapshotId: string
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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

    const response = await axiosInstance.get<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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

const takeSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  target: SnapshotList<T, K> | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ,
  date?: Date,
  projectType?: ProjectType,
  projectId?: string,
  projectState?: ProjectStateEnum,
  projectPriority?: PriorityTypeEnum,
  projectMembers?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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


// Update the getSortedList function to accept the Target type
const getSortedList = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  target: Target
): Promise<SnapshotList<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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


const snapshotContainerAPI = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const currentAppVersion = configData.currentAppVersion;

      const headersArray = [
        createAuthenticationHeaders(accessToken, userId, currentAppVersion),
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(accessToken || ""),
      ];

      const headers = Object.assign({}, ...headersArray);

      const response = await axiosInstance.get<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        `${API_BASE_URL}/${snapshotId}/container`,
        { headers: headers as Record<string, string> }
      );

      resolve(response.data);
    } catch (error) {
      const errorMessage = "Failed to get snapshot container";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  });
};

function getCurrentSnapshotAPI<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
  return new Promise((resolve, reject) => {
    snapshotApi
      .getSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, storeId, additionalHeaders)
      .then(snapshot => resolve(snapshot ?? null))
      .catch(error => reject(error));
  });
}



// Example function to simulate fetching snapshots from a database or external API
const fetchSnapshotsFromDatabase = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType>,
  event: Event,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  // Here you would make the necessary call to retrieve the snapshots
  // For now, returning an empty array or mock snapshots
  console.log('Simulating snapshot retrieval...');
  const storeId = useSecureStoreId()
  const snapshot = snapshotApi.getSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(String(snapshotId), Number(storeId))
  // Simulate response
  return [
    createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      ...snapshot,
      id: snapshotId,
      parentId: 'parent-id',
      label: 'Snapshot 1',
      timestamp: new Date().toISOString(),
      schema: 'schema-v1',
    }), 
    createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      id: snapshotId,
      parentId: 'parent-id',
      label: 'Snapshot 2',
      timestamp: new Date().toISOString(),
      schema: 'schema-v1',
    })
  ];
};


function unwrapStoreProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(props: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
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
    endpointCategory,
    snapshotContainer
  } = props;

  return {
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
    endpointCategory,
    snapshotContainer
  };
}


function getSnapshotContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string | number | undefined,
  storeId: number,
  additionalHeaders?: Record<string, string>,
  storeProps?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?:  Category, // Optional category
  snapshotStore?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Optional store to retrieve from
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  return new Promise(async (resolve, reject) => {
    try {
      const resolvedSnapshotConfig = await storeProps; 

      if (typeof snapshotId !== 'string' && typeof snapshotId !== 'number') {
        throw new Error('snapshotId must be a string or number');
      }

      if (!resolvedSnapshotConfig) {
        throw new Error("storeProps is required");
      }

      const snapshotContainer = resolvedSnapshotConfig?.snapshotContainer;

      if (!snapshotContainer) {
        throw new Error("snapshotContainer is required");
      }

      const data = await snapshotApi.getSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, additionalHeaders)

      if (data instanceof Map && snapshot !== undefined) {
        const validatedSnapshot = isSnapshotFunction<T, K>(snapshot) ? snapshot : undefined;

        if (validatedSnapshot) {
          const {
            id,
            criteria,
            category: storeCategory, // avoid shadowing parameter `category`
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
            endpointCategory
          } = unwrapStoreProps(resolvedSnapshotConfig);
          
          const snapshotConfig = snapshotApi.getSnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
            id,
            snapshotId,
            snapshotData,
            criteria,
            storeCategory, 
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
            resolvedSnapshotConfig,
            endpointCategory,
            snapshotContainer // Here, use the destructured snapshotContainer
          );

          // Merge additional properties directly into the existing snapshotContainer
          Object.assign(snapshotContainer, {
            ...(data as any),
            ...snapshotConfig,
            getSnapshot: validatedSnapshot.getSnapshot,
            find: validatedSnapshot.find,
            subscribers: validatedSnapshot.subscribers,
            name: validatedSnapshot.name,
            content: typeof resolvedSnapshotConfig.content === 'string' 
              ? resolvedSnapshotConfig.content 
              : (resolvedSnapshotConfig.content as Content<T>),
            snapshotId
          });
        }
      }

      resolve(snapshotContainer);
    } catch (error) {
      reject(error);
    }
  });
}


async function fetchSnapshotContainerData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotId: string,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotContainerData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  // Simulate fetching data, e.g., from an API or database

  const { criteria, storeId } = storeProps;
  const snapshotContainer = await getSnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, storeProps).then((snapshotContainer) => {
    return snapshotContainer;
  });
  if (snapshotContainer === null) {
    throw new Error("SnapshotContainer is not properly configured");
  }
  if(criteria === undefined){
    throw new Error("criteria is not properly configured");
  }
  const currentConfig = snapshotApi.getSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, snapshotContainer, criteria, storeId);

  if (currentConfig === null) {
    throw new Error("currentConfig is not properly configured");
  }
  return {
    id: snapshotId,
    data: {} as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    items: [] as K[], // Replace with actual data fetching logic
    config: currentConfig,
    timestamp: new Date(),
    currentCategory: "defaultCategory" // Example default value
  };
}



function createSnapshotContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T,
>(
  data: SnapshotContainerData<T, K>,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  const { id, criteria } = storeProps
  const { timestamp, currentCategory, items, config } = data;
  // Initialize mapped snapshot data
  const mappedSnapshotData = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
  
  // Real-time update implementation
  const setupRealTimeUpdates = (
    snapshotId: string,
    updateHandler: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): { unsubscribe: () => void } => {
    // In a real implementation, this would connect to your backend service
    // (WebSocket, SSE, polling, etc.) and call updateHandler when data changes
    
    // Mock implementation using polling (replace with actual real-time connection)
    const intervalId = setInterval(async () => {
      try {
        // Simulate fetching updated data
        const updatedSnapshot = await fetchUpdatedSnapshot(snapshotId);
        if (updatedSnapshot) {
          updateHandler(updatedSnapshot);
          // Update our local mapped data
          mappedSnapshotData.set(snapshotId, updatedSnapshot);
        }
      } catch (error) {
        console.error('Error in real-time updates:', error);
      }
    }, 5000); // Poll every 5 seconds (adjust as needed)

    return {
      unsubscribe: () => {
        clearInterval(intervalId);
        console.log(`Unsubscribed from real-time updates for snapshot ${snapshotId}`);
      }
    };
  };

  
    // Initialize subscriberManagement with default values
    const subscriberManagement: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      subscribers: [],
      subscription: null,
      snapshotSubscriberId: null,
      isSubscribed: false,
      // Implementations of methods can be added here as needed

      subscribeToSnapshot: (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => {
        // Generate a unique ID for this subscriber
        const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create the subscriber object
        const subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          id: subscriberId,
          snapshotId,
          callback,
          unsubscribe: () => {
            // Remove this subscriber from the list
            subscriberManagement.subscribers = subscriberManagement.subscribers?.filter(
              sub => sub.id !== subscriberId
            );
            
            // If no more subscribers, clean up the subscription
            if (subscriberManagement.subscribers.length === 0) {
              subscriberManagement.subscription?.unsubscribe(snapshotId, this, callback);
              subscriberManagement.subscription = null;
              subscriberManagement.isSubscribed = false;
            }
          }
        };

        // Add the subscriber to the list
        subscriberManagement.subscribers.push(subscriber);

        // If this is the first subscriber, set up the actual subscription
        if (!subscriberManagement.isSubscribed) {
          subscriberManagement.subscription = setupRealTimeUpdates(snapshotId, (updatedSnapshot) => {
            // Notify all subscribers of the update
            subscriberManagement.subscribers.forEach(sub => {
              sub.callback(updatedSnapshot);
            });
          });
          subscriberManagement.isSubscribed = true;
        }

        return subscriber;
      },
      getSubscribers: async (subscribers, snapshots) => ({ subscribers, snapshots }),
      notifySubscribers: async (message, subscribers, callback, data) => subscribers,
      notify: (id, message, content, data, date, type, notificationPosition) => {},
      subscribe: (snapshotId, unsubscribe, subscriber, data, event, callback, value) => [],
      manageSubscription: (snapshotId, callback, snapshot) => snapshot,
      subscribeToSnapshotList: (snapshotId, callback) => {},
      unsubscribeFromSnapshot: (snapshotId, callback) => {},
      subscribeToSnapshotsSuccess: (callback) => '',
      unsubscribeFromSnapshots: (callback) => {},
      unsubscribe: (unsubscribeDetails, callback) => {},
      subscribeToSnapshots: (snapshotStore, snapshotId, snapshotData, category, snapshotConfig, callback, snapshots, unsubscribe) => [],
      clearSnapshot: () => {},
      clearSnapshotSuccess: (context) => {},
      addToSnapshotList: async (snapshots, subscribers, storeProps) => null,
      removeSubscriber: (event, snapshotId, snapshot, snapshotStore, dataItems, criteria, category) => {},
      addSnapshotSubscriber: (snapshotId, subscriber) => {},
      removeSnapshotSubscriber: (snapshotId, subscriber) => {},
      transformSubscriber: (subscriberId, sub) => sub,
      defaultSubscribeToSnapshots: (snapshotId, callback, snapshot) => {},
      getSnapshotsBySubscriber: async (subscriber) => [],
      getSnapshotsBySubscriberSuccess: (snapshots) => {},
    };

    if(!subscriberManagement === undefined || !subscriberManagement.subscribers === undefined){
      throw new Error("can't find subscribers")
    }
    return {
      id: data.id,
      mappedSnapshotData: new Map(), // Initialize as needed
      timestamp: data.timestamp,
      currentCategory: data.currentCategory,
      criteria: {} as CriteriaType, // Set appropriate criteria
      items: [], // Store items related to the snapshot, initialize as an empty array
      config: Promise.resolve({} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>), // Configuration object for the snapshot, initialize as an empty object
      isExpired: () => false, // Flag to indicate if the snapshot is expired
      subscribers: Array.from(subscriberManagement.subscribers.keys()), // Return the list of subscriber IDs
      snapshotCategory: {
        id: data.id,
        name: data.name,
        snapshots: data.snapshots,
      }, 
      // Stores the category of the snapshot
      snapshotSubscriberId: "", // Identifier for the current subscriber
      initialConfig: {} as SnapshotConfig< BaseData<any>,  BaseData<any>>,

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
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        subscriberId: string,
        endpointCategory: string | number,
        storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category?: Category,
        snapshotId?: string | number | null,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
      ) => {
        // Logic to return a Snapshot
        return {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Placeholder
      },
      snapshotStore: null,
      snapshotData: (
        id: string | number | undefined,
        data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined,
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category?: Category,
        snapshotId?: string | number | null,
        storeId?: number
      ): Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
        return new Promise((resolve, reject) => {
          try {
            if (id === undefined || id === null) {
              throw new Error("Invalid id: id cannot be undefined or null.");
            }
          
            const idStr = String(id);
          
            if (!mappedSnapshotData) {
              throw new Error("mappedSnapshotData is null or undefined.");
            }

            // Handle snapshot data
            const existingSnapshot = mappedSnapshotData.get(idStr);
            const updatedData = existingSnapshot ? { ...existingSnapshot, ...data } : data;
            mappedSnapshotData.set(idStr, updatedData);

            // Process the snapshot data
            const processedSnapshotData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
              id,
              snapshotId,
              data: updatedData,
              category,
              categoryProperties,
              timestamp: updatedData.timestamp || new Date().toISOString(),
              metadata: updatedData.metadata,
              // Include any other required properties
            };

            // Handle the async save operation
            dataStoreMethods.save(processedSnapshotData)
              .then(() => resolve(processedSnapshotData))
              .catch(error => {
                console.error("Failed to save snapshot data:", error);
                reject(new Error("Failed to process snapshot data"));
              });
          } catch (error) {
            console.error("Error in snapshotData:", error);
            reject(error);
          }
        });
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

      getSnapshotData: (
        id: string | number | undefined,
        snapshotId: number,
        snapshotData: T,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category?: Category,
      ): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined => {
        // Fetch logic to get snapshot data based on ID
        return data.mappedSnapshotData.get(id); 
      },

      deleteSnapshot: (id: string): boolean => {
        const deleted = data.mappedSnapshotData.delete(id); // Delete snapshot by ID
        return deleted; // Return true if deletion was successful
      },
      // Additional properties from SnapshotData and SnapshotRelationships, if needed
    };
  }


export function extractCriteria<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
  properties: Array<keyof FilterState>
): Partial<FilterState> {
  return properties.reduce((criteria, prop) => {
    if (snapshot && prop in snapshot) {
      (criteria as Partial<FilterState>)[prop] =
        (snapshot as any)[prop];
    }
    return criteria;
  }, {} as Partial<FilterState>);
}


const getSnapshotCriteria = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot?: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    criteria: CriteriaType,
    category?: Category,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainerData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  ) => Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  snapshotObj?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
  snapshotStoreConfigSearch?: SnapshotStoreConfig<
  SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData>>

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
export async function getSnapshotConfig<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string | number,
  snapshotId: string | null,
  criteria: CriteriaType,
  category?: Category,
  categoryProperties?: CategoryProperties,
  subscriberId?: string,
  delegate?: Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot?: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties?: CategoryProperties,
    callback?: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore?: DataStore<T, K>,
    dataStoreMethods?: DataStoreMethods<T, K>,
    metadata?: UnifiedMetadata<T, K, Meta, keyof T>,
    subscriberId?: string,
    endpointCategory?: string | number,
    storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription?: Subscription<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  endpointCategory?: string | number,
  snapshotContainer?: Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  try {
    // 🔹 1. Resolve subscription
    const subscription = subscriptionServiceInstance.subscriptions.get("snapshot");
    if (!subscription) throw new Error("Unable to find a subscription for snapshot config");

    // 🔹 2. Authentication
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const currentAppVersion = configData.currentAppVersion;
    const authenticationHeaders = createAuthenticationHeaders(accessToken, userId, currentAppVersion);

    // 🔹 3. Merge headers
    const headers = Object.assign(
      {},
      authenticationHeaders,
      createCacheHeaders(),
      createContentHeaders(),
      generateCustomHeaders({}),
      createRequestHeaders(accessToken || "")
    );

    const storeId = useSecureStoreId();
    if (!storeId) throw new Error("No store id found");

    // 🔹 4. Validate IDs
    const snapshotCriteriaId = getSnapshotId(criteria);
    if (!snapshotCriteriaId) throw new Error("Invalid snapshot criteria ID");

    // 🔹 5. Fetch base snapshot store data
    const snapshotStore = await fetchSnapshotStoreData(id);

    // 🔹 6. Fetch container and config
    const containerPromise = snapshotApi.getSnapshotContainer(
      snapshotCriteriaId,
      Number(storeId),
      headers,
      storeProps!,
      category,
      snapshotStore
    );

    const snapshotStoreConfig = await snapshotApi.getSnapshotStoreConfig(
      snapshotCriteriaId,
      containerPromise,
      criteria,
      storeId,
      snapshot
    );

    // 🔹 7. Fetch snapshot config from API
    const response = await axiosInstance.post<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      `${API_BASE_URL}/${snapshotCriteriaId}/config`,
      {
        snapshotContainer: containerPromise,
        criteria,
        category,
        categoryProperties,
        delegate,
      },
      { headers: headers as Record<string, string> }
    );

    const snapshotConfigData = response.data;

    // 🔹 8. Resolve container
    const resolvedContainer = await containerPromise;
    if (!resolvedContainer) throw new Error("SnapshotContainer is undefined");

    // 🔹 9. Run snapshot callback if available
    if (id && snapshotId && snapshot) {
      await snapshot(
        id,
        snapshotId,
        resolvedContainer.snapshotData!,
        category,
        categoryProperties,
        async (snapshotStoreResolved) => {
          if (!snapshotStoreResolved?.snapshotData || snapshotStoreResolved.snapshotData instanceof Map) return;

          const storeId = snapshotStoreResolved.snapshotData.storeId;
          if (!storeId) throw new Error(`No storeId associated with ${snapshotStoreResolved.name}`);

          const snapshotStore = await snapshotApi.getSnapshotStore(storeId, resolvedContainer, criteria);
          dispatch(
            (await useSnapshotStore(addToSnapshotList, storeProps!)).updateSnapshotStore(
              await snapshotStore,
              snapshotId,
              new Map(),
              {},
              [],
              {} as Snapshot<T, K>,
              {} as ConfigureSnapshotStorePayload<T, K>,
              resolvedContainer,
              () => {},
            )
          );
        },
        {} as DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        {} as DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        subscriberId,
        endpointCategory,
        storeProps,
        snapshotConfigData,
        subscription,
        snapshotStoreConfig,
        resolvedContainer
      );
    }

    // 🔹 10. Return final config
    return snapshotConfigData;

  } catch (error) {
    const errorMessage = "Failed to get snapshot config";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
}


const getSnapshotStoreConfigData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  criteria: CriteriaType,
  storeId: number,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
      const response = await axiosInstance.post<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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


const getSnapshotConfigData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  criteria: CriteriaType, 
  storeId: number
): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
      const response = await axiosInstance.post<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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

const getSnapshotStoreConfig = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  criteria: CriteriaType,
  storeId: number,
  snapshotFunction: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    criteria: CriteriaType,
    category?: Category,    
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData>>,
    snapshotContainerData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) => Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
      const response = await axiosInstance.post<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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

const getSnapshotStore = <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: number | null,
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeId: number,
  criteria: CriteriaType,
  snapshotFunction: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    criteria: CriteriaType,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, SnapshotWithCriteria<any, BaseData>>,
    snapshotContainerData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) => Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
      const response = await axiosInstance.post<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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


const findSnapshotStoresById = async<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(id: number): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const appVersion = configData.currentAppVersion;

      // Combine headers as done in `getSnapshotId`
      const headersArray = [
        createAuthenticationHeaders(token, userId, appVersion),
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(token || ""),
      ];

      const headers = Object.assign({}, ...headersArray);

      // Make the request with the provided ID as a parameter
      const response = await axiosInstance.get(`/snapshotStores`, {
        headers: headers as Record<string, string>,
        params: { id },
      });

      if (response.status === 200 && response.data.length > 0) {
        resolve(response.data); // Assuming response.data contains an array of `SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`
      } else {
        reject(new Error("Failed to retrieve snapshot stores by ID"));
      }
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to find snapshot stores by ID");
      reject(error);
    }
  });
};


const retrieveSnapshots = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string | number | null,
  storeId: number,
  snapshot: Snapshot<any>, // Use the appropriate type for T
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  additionalHeaders: Record<string, string> = {}
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    // Fetch snapshot by ID
    const snapshot = await getSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      snapshotId,
      storeId,
      snapshot,
      storeId,
      type,
      event,
      snapshotConfig,
      additionalHeaders
    );
    if (snapshot) {
      return [snapshot]; // Return single snapshot in an array
    }

    // Fetch multiple snapshots if not found by ID
    const response = await axiosInstance.post<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>(
      `${API_BASE_URL}/snapshots/retrieve`,
      { snapshotConfig },
      { headers: additionalHeaders }
    );

    if (response.data) {
      return response.data;
    } else {
      console.warn("No snapshots found with the provided configuration.");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving snapshots:", error);
    return [];
  }
};


const mapSnapshotData = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Extract relevant data from the snapshot
    const { id, data } = snapshot;

    const {
      versionData = createDefaultVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
      latestVersion = createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
      ...rest
    } = data;
    

    // Example logic: Apply transformation based on the configuration
    const updatedConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...config,
      lastUpdated: {
        versionData,
        latestVersion,
        timestamp: new Date(),
        versions: [],
        currentVersionIndex: 0
      },
      // Add or update timestamps
      metadata: {
        ...config.metadata,
        mappedFrom: id, // Track source of the mapping
      },
    };

    if(id === undefined){
      throw new Error("Snapshot ID is undefined");
    }

    // Update the Map with the new configuration
    mappedData.set(id.toString(), updatedConfig);

    console.log(`Mapped snapshot ID ${id} to configuration`, updatedConfig);
    return updatedConfig;
  } catch (error) {
    console.error("Error mapping snapshot data:", error);
    throw error;
  }
};


const sortSnapshotData = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    console.log("Sorting snapshot data...");
    
    // Retrieve data to sort from the map
    const dataArray = Array.from(mappedData.values());

    // Sorting logic (customize as needed)
    const sortedData = dataArray.sort((a, b) => {
      const aTimestamp = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTimestamp = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTimestamp - bTimestamp;
    });

    // Update the map with sorted data
    sortedData.forEach((data) => {
      if (data.storeId) {
        mappedData.set(data.storeId, data);
      }
    });

    return config; // Return updated config if necessary
  } catch (error) {
    console.error("Error while sorting snapshot data:", error);
    throw error;
  }
};


const categorizeSnapshotData = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    console.log("Categorizing snapshot data...");

    // Define a categorization criterion (customize as needed)
    const getCategory = (data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string => {
      // If category is a symbol, convert it to string, otherwise return as is
      if (typeof data.category === 'symbol') {
        return data.category.toString(); // Convert symbol to string
      }
      return data.category || "default"; // Default to "default" if undefined
    };

    // Categorize and group data
    const categorizedData = new Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>();

    mappedData.forEach((data) => {
      const category = getCategory(data);
      if (!categorizedData.has(category)) {
        categorizedData.set(category, []);
      }
      categorizedData.get(category)?.push(data);
    });

    // Debug categorization
    categorizedData.forEach((group, category) => {
      console.log(`Category: ${category}, Count: ${group.length}`);
    });

    return config; // Return updated config if necessary
  } catch (error) {
    console.error("Error while categorizing snapshot data:", error);
    throw error;
  }
};

const searchSnapshotData = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    console.log("Searching snapshot data...");

    // Define the search query based on the snapshot or operation

    // Ensure query is a string
    const query = typeof operation.query === "string" ? operation.query : snapshot.title || "default";

    // Perform the search using the search API
    const searchResults = await searchAPI<T, K>(query);

    // Process the search results
    searchResults.forEach((result) => {
      const snapshotId = result.id;
      const existingConfig = mappedData.get(Number(snapshotId));

      if (existingConfig) {
        // Merge search result into existing config if applicable
        mappedData.set(Number(snapshotId), {
          ...existingConfig,
          ...result,
          category: result.categories?.[0] || "Uncategorized", // Ensure category is only added once

        });
      } else {
        // Add a new config for unmatched search results
        mappedData.set(Number(snapshotId), {
          storeId: snapshotId,
          category: result.categories?.[0] || "Uncategorized",
          ...config,
        });
      }
    });

    console.log("Search results processed and updated in mappedData.");

    // Return the updated configuration
    return config;
  } catch (error) {
    console.error("Error while searching snapshot data:", error);
    throw error;
  }
};

const deleteSnapshot = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  operation?: SnapshotOperations<T, K>
): Promise<boolean> => {
  try {
    console.log(`Attempting to delete snapshot with ID: ${snapshotId}...`);

    // Check if the snapshot exists in the mappedData
    if (!mappedData.has(snapshotId)) {
      console.warn(`Snapshot with ID: ${snapshotId} not found.`);
      return false; // Snapshot not found
    }

    // Handle any custom pre-deletion operations if defined
    if (operation?.preDelete) {
      await operation.preDelete(snapshotId, mappedData.get(snapshotId));
    }

    // Remove the snapshot from the mapped data
    mappedData.delete(snapshotId);
    console.log(`Snapshot with ID: ${snapshotId} successfully deleted.`);

    // Handle any custom post-deletion operations if defined
    if (operation?.postDelete) {
      await operation.postDelete(snapshotId);
    }

    return true; // Deletion successful
  } catch (error) {
    console.error(`Error while deleting snapshot with ID: ${snapshotId}`, error);
    throw error; // Rethrow the error for further handling
  }
};


const updateSnapshotStore = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  storeId: number, // ID of the SnapshotStore to update
  updatedData: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Partial data to update
  additionalHeaders?: Record<string, string> // Optional headers
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Fetch the existing SnapshotStore
    const existingStore = await fetchSnapshotStoreData<T, K>(storeId);

    if (!existingStore) {
      throw new Error(`SnapshotStore with ID ${storeId} not found.`);
    }

    // Merge the existing store with the updated data
    const updatedStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...existingStore,
      ...updatedData,
    };

    // Prepare headers
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
      additionalHeaders || {},
    ];
    const headers = Object.assign({}, ...headersArray);

    // Make the API request to update the SnapshotStore
    const response = await axiosInstance.put<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      `${API_BASE_URL}/snapshotStores/${storeId}`,
      updatedStore,
      { headers }
    );

    if (response.status === 200) {
      console.log(`SnapshotStore with ID ${storeId} updated successfully.`);
      return response.data;
    } else {
      throw new Error(`Failed to update SnapshotStore. Status: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = `Failed to update SnapshotStore with ID ${storeId}`;
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};

const deleteSnapshotStore = async (
  storeId: number, // ID of the SnapshotStore to delete
  additionalHeaders?: Record<string, string> // Optional headers
): Promise<boolean> => {
  try {
    // Prepare headers
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
      additionalHeaders || {},
    ];
    const headers = Object.assign({}, ...headersArray);

    // Make the API request to delete the SnapshotStore
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/snapshotStores/${storeId}`,
      { headers }
    );

    if (response.status === 204) {
      console.log(`SnapshotStore with ID ${storeId} deleted successfully.`);
      return true;
    } else {
      throw new Error(`Failed to delete SnapshotStore. Status: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = `Failed to delete SnapshotStore with ID ${storeId}`;
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};



const mapSnapshots = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Array of snapshots to process
  mapper: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Mapping function
  additionalHeaders?: Record<string, string> // Optional headers
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    // Validate input
    if (!Array.isArray(snapshots)) {
      throw new Error("snapshots must be an array.");
    }

    if (typeof mapper !== "function") {
      throw new Error("mapper must be a function.");
    }

    // Apply the mapper function to each snapshot
    const mappedSnapshots = await Promise.all(
      snapshots.map(async (snapshot) => {
        try {
          // Apply the mapper function to the snapshot
          const mappedSnapshot = await mapper(snapshot);
          return mappedSnapshot;
        } catch (error) {
          console.error(`Error mapping snapshot with ID ${snapshot.id}:`, error);
          throw error; // Rethrow to stop processing if any snapshot fails
        }
      })
    );

    console.log("Successfully mapped snapshots.");
    return mappedSnapshots;
  } catch (error) {
    const errorMessage = "Failed to map snapshots.";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    throw error;
  }
};
 

// Singleton instance
export const snapshotApi = new SnapshotApi();
export default snapshotApi;

export {
  getSnapshot,
  getSnapshotCriteria,
  getSnapshotId,
  // ... other exports
};