import axiosInstance from '@/app/api/csrfToken';
import { BaseData } from '@/app/models/data/Data';
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { CreateSnapshotsPayload, CreateSnapshotStoresPayload, UpdateSnapshotPayload } from '@/app/components/server/database/Payload';
import { SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotWithCriteria } from '@/app/components/snapshots';
import { VideoData } from "@/app/components/video/Video";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { CombinedEvents, SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { PriorityTypeEnum, StatusType } from '@/app/models/data/StatusType';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotStoreProps } from '@/app/snapshots//useSnapshotStore';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotOperation, SnapshotOperationType } from '@/app/snapshots/SnapshotActions';
import { SnapshotItem } from '@/app/snapshots/SnapshotList';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { InitializedData, InitializedDataStore } from '@/app/snapshots/SnapshotStoreOptions';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from '@/app/subscribers/Subscriber';
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { snapshotId } from "@/app/utils/snapshotUtils";
import { RealtimeDataItem } from '@/components/models/realtime/RealtimeData';
import { DataStoreWithSnapshotMethods } from '@/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { convertSnapshotToMap } from '@/components/typings/YourSpecificSnapshotType';
import { CategoryProperties } from '@/pages/personas/ScenarioBuilder';
import Version from '@/versions/Version';


// Define the API endpoint for retrieving snapshot data
const SNAPSHOT_DATA_API_URL = "https://example.com/api/snapshot";

// Define the type for the response data
interface SnapshotDataResponse<
  T extends  BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>
  extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string | number;
  timestamp: Date
  videoData: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  category: string
  // Other properties...
}

// Define the Snapshot interface including the responseData property
interface RetrievedSnapshot<
  T extends  BaseData<any> =BaseData<any, any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>{
  id: string;
  responseData: T; // This property should extend `Data`
  timestamp: string | Date;
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  category?:  Category;
  categoryProperties?: CategoryProperties;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void>>;
}


// Define a nction to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot< BaseData<any>, Data>>
const converSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  retrievedSnapshot: RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshots: any, 
  snapshotConfig: any, 
  meta: any, 
  snapshotMethods: any, 
  getSnapshotsBySubscriber: any,
  getSnapshotsBySubscriberSuccess: any,
  getSnapshotsByTopic: any,
  getSnapshotsByTopicSuccess: any,
  getSnapshotsBycategory: symbol | string | Category | undefined,
  getSnapshotsByCategorySuccess: any,
  getSnapshotsByKey: any,
  getSnapshotsByKeySuccess: any,
  getSnapshotsByPriority: any,
  getSnapshotsByPrioritySuccess: any,
  getStoreData: any,
  updateStoreData: any,
  updateDelegate: any,
  getSnapshotContainer: any,
  getSnapshoersions: any,
  createSnshot: any,
  deleteSnapshot: any,
  snapshotStoreConfig: any,
  getSnapshotItems: any,
  dataStore: any,
  initialState: any,
  snapshotItems: any,
  nestedStores: any,
  snapshotIds: any,
  dataStoreMethods: any,
  delegate: any,
  findSnapshotStoreById: any,
  saveSnapshotStore: any,
  subscriberId: any,
  length: any,
  content: any,
  value: any,
  todoSnapshotId: any,
  snapshotStore: any,
  dataItems: any,
  newData: any,
  handleSnapshotOperation: any,
  tStore: any,
  adtore: any,
  getCustomStore: any,
  addSCustomStore: any,
  removeStore: any,
  onSnapshot: any,
  getData: any,
  getDataStore: any,
  addSnapshotToStore: any,
  addSnapshotItem: any,
  addNestedStore: any,
  defaultSubscribeToSnapshots: any,
  defaultCreateSnapshotStores: any,
  createSnapshotStores: any,
  subscribeToSnapshots: any,
  subscribeToSnapshot: any,
  defaultOnSnapshots: any,
  onSnapshots: any,
  transformSubscriber: any,
  isSnapshotStoreConfig: any,
  transformDelegate: any,
  initializedState: any,
  transformedDelegate: any,
  getSnapshotIds: any,
  getNestedStores: any,
  getAllKeys: any,
  mapSnapshot: any,
  getAllItems: any,
  addData: any,
  addDataStatus: any,
  removeData: any,
  updateData: any,
  updateDataTitle: any,
  updateDataDescription: any,
  updateDataStatus: any,
  addDataSuccess: any,
  getDataVersions: any,
  updateDataVersions: any,
  getBackendVersion: any,
  getFrontendVersion: any,
  fetchData: any,
  defaultSubscribeToSnapshot: any,
  handleSubscribeToSnapshot: any,
  removeItem: any, // Placeholder
  getSnapshot: any, // Placeholder
  getSnapshotSuccess: any, // Placeholder
  getSnapshotId: any, // Placeholder
  getItem: any, // Placeholder
  setItem: any, // Placeholder
  addSnapshotFailure: any, // Placeholder
  addSnapshotSuccess: any, // Placeholder
  getParentId: any, // Placeholder
  getChildIds: any, // Placeholder
  compareSnapshotState: any, // Placeholder
  deepCompare: any, // Placeholder
  shallowCompare: any, // Placeholder
  getDataStoreMethods: any, // Placeholder
  getDelegate: any, // Placeholder
  determinecategory: symbol | string | Category | undefined, // Placeholder
  determineSnapshotStorecategory: symbol | string | Category | undefined, // Placeholder
  determinePrefix: any, // Placeholder
  updateSnapshot: any, // Placeholder
  updateSnapshotSuccess: any, // Placeholder
  updateSnapshotFailure: any, // Placeholder
  removeSnapshot: any, // Placeholder
  clearSnapshots: any, // Placeholder
  addSnapshot: any, // Placeholder
  createInitSnapshot: any, // Placeholder
  createSnapshotSuccess: any, // Placeholder
  clearSnapshotSuccess: any, // Placeholder
  clearSnapshotFailure: any, // Placeholder
  createSnapshotFailure: any, // Placeholder
  setSnapshotSuccess: any, // Placeholder
  setSnapshotFailure: any, // Placeholder
  updateSnapshots: any, // Placeholder
  updateSnapshotsSuccess: any, // Placeholder
  updateSnapshotsFailure: any, // Placeholder
  initSnapshot: any, //Placeholder
  takeSnapshot: any, // Placeholder
  takeSnapshotSuccess: any, // Placeholder
  takeSnapshotsSuccess: any, // Placeholder
  configureSnapshotStore: any, // Placeholder
  flatMap: any, // Placeholder
  setData: any, // Placeholder
  getState: any, // Placeholder
  setState: any, // Placeholder
  validateSnapshot: any, // Placeholder
  handleSnapshot: any, // Placeholder
  handleActions: any, // Placeholder
  setSnapshot: any, // Placeholder
  transformSnapshotConfig: any, // Placeholder
  setSnapshotData: any, // Placeholder
  setSnapshots: any, // Placeholder
  clearSnapshot: any, // Placeholder
  mergeSnapshots: any, // Placeholder
  reduceSnapshots: any, // Placeholder
  sortSnapshots: any, // Placeholder
  filterSnapshots: any, // Placeholder
  mapSnapshotsAO: any, // Placeholder
  mapSnapshots: any, // Placeholder
  findSnapshot: any, // Placeholder
  getSubscribers: any, // Placeholder
  notify: any, // Placeholder
  notifySubscribers: any, // Placeholder
  subscribe: any, // Placeholder
  unsubscribe: any, // Placeholder
  fetchSnapshot: any, // Placeholder
  fetchSnapshotSuccess: any, // Placeholder
  fetchSnapshotFailure: any, // Placeholder
  getSnapshots: any, // Placeholder
  getAllSnapshots: any, // Placeholder
  getSnapshotStoreData: any, // Placeholder
  generateId: any, // Placeholder
  batchFetchSnapshots: any, // Placeholder
  batchTakeSnapshotsRequest: any, // Placeholder
  batchUpdateSnapshotsRequest: any, // Placeholder
  batchFetchSnapshotsSuccess: any, // Placeholder
  batchFetchSnapshotsFailure: any, // Placeholder
  batchUpdateSnapshotsSuccess: any, // Placeholder
  batchUpdateSnapshotsFailure: any, // Placeholder
  batchTakeSnapshot: any, // Placeholder
  handleSnapshotSuccess: any, // Placeholder
  storeProps: SnapshotStoreProps<T, K>
): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

  const {storeId, name, version, schema, options, category, config, operation, expirationDate, payload, callback, endpointCategory} = storeProps
  const snapshotData = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({ initialState, storeId, name, version, schema, options, category, config, operation, expirationDate, payload, callback, storeProps, endpointCategory});
  // Create the Snapshot object from retrievedSnapshot
  const snapshot = {
    // Core Snapshot Properties
    id: retrievedSnapshot.id,
    parentId: retrievedSnapshot.parentId,
    label: retrievedSnapshot.label,
    timestamp: retrievedSnapshot.timestamp,
    schema: retrievedSnapshot.schema,
    currentCategory: retrievedSnapshot.currentCategory,
    mappedSnapshotData: retrievedSnapshot.mappedSnapshotData,
    config: retrievedSnapshot.config,
   
    items: retrievedSnapshot.items,
    payload: retrievedSnapshot.payload,
    updateSnapshotFailure: retrievedSnapshot.updateSnapshotFailure,
    
    getSnapshotById: retrievedSnapshot.getSnapshotById,
    
    
    // Category
    category: retrievedSnapshot.category,
    setCategory: retrievedSnapshot.setCategory,
    determineCategory: retrievedSnapshot.determineCategory,
    
    // Data
    data: retrievedSnapshot.data as T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined,
    newData: retrievedSnapshot.newData,
    dataItems: retrievedSnapshot.dataItems,
    getData: retrievedSnapshot.getData,
    setData: retrievedSnapshot.setData,
    addData: retrievedSnapshot.addData,
    addDataStatus: retrievedSnapshot.addDataStatus,
    removeData: retrievedSnapshot.removeData,
    updateData: retrievedSnapshot.updateData,
    updateDataTitle: retrievedSnapshot.updateDataTitle,
    updateDataDescription: retrievedSnapshot.updateDataDescription,
    updateDataStatus: retrievedSnapshot.updateDataStatus,
    updateDataVersions: retrievedSnapshot.updateDataVersions,
    getDataVersions: retrievedSnapshot.getDataVersions,
  
    // Store Management
    snapshotStore: retrievedSnapshot.snapshotStore ?? null,
    snapshotStoreConfig: retrievedSnapshot.snapshotStoreConfig ?? null,
    applyStoreConfig: retrievedSnapshot.applyStoreConfig,
    addStoreConfig: retrievedSnapshot.addStoreConfig,
    getStores: retrievedSnapshot.getStores,
    getStore: retrievedSnapshot.getStore,
    addStore: retrievedSnapshot.addStore,
    removeStore: retrievedSnapshot.removeStore,
    mapSnapshot: retrievedSnapshot.mapSnapshot,
    mapSnapshotWithDetails: retrievedSnapshot.mapSnapshotWithDetails,
    configureSnapshotStore: retrievedSnapshot.configureSnapshotStore,
    addNestedStore: retrievedSnapshot.addNestedStore,
    clearSnapshots: retrievedSnapshot.clearSnapshots,
  
    // Event Handling
    callbacks: retrievedSnapshot.callbacks,
    eventRecords: retrievedSnapshot.events?.eventRecords ?? null,
    eventIds: retrievedSnapshot.events?.eventIds ? retrievedSnapshot.events?.eventIds : [],
    onSnapshotAdded: retrievedSnapshot.events?.onSnapshotAdded ?? (() => {}),
    onSnapshotRemoved: retrievedSnapshot.events?.onSnapshotRemoved ?? (() => {}),
    onSnapshotUpdated: retrievedSnapshot.events?.onSnapshotUpdated ?? (() => {}),
    on: retrievedSnapshot.events?.on ?? (() => {}),
    off: retrievedSnapshot.events?.off ?? (() => {}),
    emit: retrievedSnapshot.emit,
    once: retrievedSnapshot.events?.once ?? (() => {}),
    addRecord: retrievedSnapshot.events?.addRecord ?? (() => {}),
    removeAllListeners: retrievedSnapshot.events?.removeAllListeners ?? (() => {}),
    subscribe: retrievedSnapshot.events?.subscribe ?? (() => {}),
    unsubscribe: retrievedSnapshot.unsubscribe,
    trigger: retrievedSnapshot.events?.trigger ?? (() => {}),
  
    // Snapshot Actions
    createSnapshot: retrievedSnapshot.createSnapshot,
    createSnapshots: retrievedSnapshot.createSnapshots,
    createInitSnapshot: retrievedSnapshot.createInitSnapshot,
    initSnapshot: retrievedSnapshot.initSnapshot,
    takeSnapshot: retrievedSnapshot.takeSnapshot,
    addSnapshot: retrievedSnapshot.addSnapshot,
    addSnapshotItem: retrievedSnapshot.addSnapshotItem,
    updateSnapshots: retrievedSnapshot.updateSnapshots,
    removeSnapshot: retrievedSnapshot.removeSnapshot,
    restoreSnapshot: retrievedSnapshot.restoreSnapshot,
    mergeSnapshots: retrievedSnapshot.mergeSnapshots,
    reduceSnapshots: retrievedSnapshot.reduceSnapshots,
    filterSnapshotsByStatus: retrievedSnapshot.filterSnapshotsByStatus,
    filterSnapshotsByCategory: retrievedSnapshot.filterSnapshotsByCategory,
    filterSnapshotsByTag: retrievedSnapshot.filterSnapshotsByTag,
    findSnapshot: retrievedSnapshot.findSnapshot,
    
    // Snapshot Config
    initialConfig: retrievedSnapshot.initialConfig,
    handleSnapshotConfig: retrievedSnapshot.handleSnapshotConfig,
    getSnapshotConfig: retrievedSnapshot.getSnapshotConfig,
    transformSnapshotConfig: retrievedSnapshot.transformSnapshotConfig,
    getSnapshotConfigItems: retrievedSnapshot.getSnapshotConfigItems,
    getConfigOption: retrievedSnapshot.getConfigOption,
    handleSnapshot: retrievedSnapshot.handleSnapshot,
    
    // Snapshot State Management
    getState: retrievedSnapshot.getState,
    setState: retrievedSnapshot.setState,
    compareSnapshotState: retrievedSnapshot.compareSnapshotState,
    validateSnapshot: retrievedSnapshot.validateSnapshot,
    getInitialState: retrievedSnapshot.getInitialState,
    clearSnapshot: retrievedSnapshot.clearSnapshot,
    getDataStoreMap: retrievedSnapshot.getDataStoreMap,
    getDataStore: retrievedSnapshot.getDataStore,
    getDataStoreMethods: retrievedSnapshot.getDataStoreMethods,
    
    // Subscriptions
    subscribers: retrievedSnapshot.subscribers,
    subscribeToSnapshots: retrievedSnapshot.subscribeToSnapshots,
    subscribeToSnapshot: retrievedSnapshot.subscriberManagement?.subscribeToSnapshot ? retrievedSnapshot.subscriberManagement?.subscribeToSnapshot : undefined,
    unsubscribeFromSnapshot: retrievedSnapshot.subscriberManagement?.unsubscribeFromSnapshot ? retrievedSnapshot.subscriberManagement?.unsubscribeFromSnapshot : undefined,
    unsubscribeFromSnapshots: retrievedSnapshot.subscriberManagement?.unsubscribeFromSnapshots ? retrievedSnapshot.subscriberManagement?.unsubscribeFromSnapshots : undefined,
    subscribeToSnapshotsSuccess: retrievedSnapshot.subscriberManagement?.subscribeToSnapshotsSuccess ? retrievedSnapshot.subscriberManagement?.subscribeToSnapshotsSuccess : undefined,
    addSnapshotSubscriber: retrievedSnapshot.subscriberManagement?.addSnapshotSubscriber ? retrievedSnapshot.subscriberManagement?.addSnapshotSubscriber : undefined,
    removeSnapshotSubscriber: retrievedSnapshot.subscriberManagement?.removeSnapshotSubscriber ? retrievedSnapshot.subscriberManagement?.removeSnapshotSubscriber : undefined,
    subscribeToSnapshotList: retrievedSnapshot.subscriberManagement?.subscribeToSnapshotList ? retrievedSnapshot.subscriberManagement?.subscribeToSnapshotList : undefined,
    defaultSubscribeToSnapshots: retrievedSnapshot.defaultSubscribeToSnapshots,
    defaultSubscribeToSnapshot: retrievedSnapshot.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: retrievedSnapshot.handleSubscribeToSnapshot,
    getSubscribers: retrievedSnapshot.getSubscribers,
    notify: retrievedSnapshot.subscriberManagement?.notify ? retrievedSnapshot.subscriberManagement?.notify : undefined,
    notifySubscribers: retrievedSnapshot.notifySubscribers,
    
    // Snapshot Processing
    deepCompare: retrievedSnapshot.deepCompare,
    shallowCompare: retrievedSnapshot.shallowCompare,
    transformSubscriber: retrievedSnapshot.transformSubscriber,
    transformDelegate: retrievedSnapshot.transformDelegate,
    reduceSnapshotItems: retrievedSnapshot.reduceSnapshotItems,
    flatMap: retrievedSnapshot.flatMap,
    mapSnapshots: retrievedSnapshot.mapSnapshots,
    sortSnapshots: retrievedSnapshot.sortSnapshots,
    filterSnapshots: retrievedSnapshot.filterSnapshots,
    
    // Batch Operations
    batchTakeSnapshot: retrievedSnapshot.batchTakeSnapshot,
    batchFetchSnapshots: retrievedSnapshot.batchFetchSnapshots,
    batchTakeSnapshotsRequest: retrievedSnapshot.batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: retrievedSnapshot.batchUpdateSnapshotsRequest,
    batchFetchSnapshotsSuccess: retrievedSnapshot.batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: retrievedSnapshot.batchFetchSnapshotsFailure,
    batchUpdateSnapshotsSuccess: retrievedSnapshot.batchUpdateSnapshotsSuccess,
    batchUpdateSnapshotsFailure: retrievedSnapshot.batchUpdateSnapshotsFailure,
  
    // Snapshot Success & Failure Handlers
    addSnapshotSuccess: retrievedSnapshot.addSnapshotSuccess,
    addSnapshotFailure: retrievedSnapshot.addSnapshotFailure,
    getSnapshotSuccess: retrievedSnapshot.getSnapshotSuccess,
    updateSnapshotSuccess: retrievedSnapshot.updateSnapshotSuccess,
    updateSnapshotsSuccess: retrievedSnapshot.updateSnapshotsSuccess,
    updateSnapshotsFailure: retrievedSnapshot.updateSnapshotsFailure,
    createSnapshotSuccess: retrievedSnapshot.createSnapshotSuccess,
    createSnapshotFailure: retrievedSnapshot.createSnapshotFailure,
    getSnapshotItemsSuccess: retrievedSnapshot.getSnapshotItemsSuccess,
    getSnapshotItemSuccess: retrievedSnapshot.getSnapshotItemSuccess,
    getSnapshotIdSuccess: retrievedSnapshot.getSnapshotIdSuccess,
    getSnapshotValuesSuccess: retrievedSnapshot.getSnapshotValuesSuccess,
    setSnapshotFailure: retrievedSnapshot.setSnapshotFailure,
    fetchSnapshotSuccess: retrievedSnapshot.fetchSnapshotSuccess,
    fetchSnapshotFailure: retrievedSnapshot.fetchSnapshotFailure,
    setSnapshotSuccess: retrievedSnapshot.setSnapshotSuccess,

    takeSnapshotSuccess: retrievedSnapshot.takeSnapshotSuccess,
    takeSnapshotsSuccess: retrievedSnapshot.takeSnapshotsSuccess,


    // Nested Structures and Hierarchies
    getParentId: retrievedSnapshot.getParentId,
    getChildIds: retrievedSnapshot.getChildIds,
    addChild: retrievedSnapshot.addChild,
    removeChild: retrievedSnapshot.removeChild,
    getChildren: retrievedSnapshot.getChildren,
    hasChildren: retrievedSnapshot.hasChildren,
    isDescendantOf: retrievedSnapshot.isDescendantOf,
  
    // Snapshot Retrieval & Comparison
    getSnapshotId: retrievedSnapshot.getSnapshotId,
    getSnapshot: retrievedSnapshot.getSnapshot,
    getSnapshotWithCriteria: retrievedSnapshot.getSnapshotWithCriteria,
    fetchSnapshot: retrievedSnapshot.fetchSnapshot,
    getAllSnapshots: retrievedSnapshot.getAllSnapshots,
    getSnapshotKeys: retrievedSnapshot.getSnapshotKeys,
    getAllKeys: retrievedSnapshot.getAllKeys,
    getAllValues: retrievedSnapshot.getAllValues,
    getSnapshotEntries: retrievedSnapshot.getSnapshotEntries,
    getAllSnapshotEntries: retrievedSnapshot.getAllSnapshotEntries,
    getSnapshotItems: retrievedSnapshot.getSnapshotItems,
    compareSnapshots: retrievedSnapshot.compareSnapshots,
    compareSnapshotItems: retrievedSnapshot.compareSnapshotItems,

    initialState: retrievedSnapshot.initialState,
    isCore: retrievedSnapshot.isCore,
    removeSubscriber: retrievedSnapshot.subscriberManagement?.removeSubscriber ? retrievedSnapshot.subscriberManagement?.removeSubscriber : undefined,
    onInitialize: retrievedSnapshot.onInitialize,
   
    onError: retrievedSnapshot.onError,
    taskIdToAssign: retrievedSnapshot.taskIdToAssign,
    snapshot: retrievedSnapshot.snapshot,
    generateId: retrievedSnapshot.generateId,
   
    snapshotData: retrievedSnapshot.snapshotData,
    versionInfo: retrievedSnapshot.versionInfo,
    initializedState: retrievedSnapshot.initializedState,
    getAllItems: retrievedSnapshot.getAllItems,
   
    addDataSuccess: retrievedSnapshot.addDataSuccess,
    getBackendVersion: retrievedSnapshot.getBackendVersion,
    getFrontendVersion: retrievedSnapshot.getFrontendVersion,
    fetchData: retrievedSnapshot.fetchData,
   
    removeItem: retrievedSnapshot.removeItem,
    setItem: retrievedSnapshot.setItem,
    getItem: retrievedSnapshot.getItem,
    getDelegate: retrievedSnapshot.getDelegate,
   
    determinePrefix: retrievedSnapshot.determinePrefix,
    getSnapshotListByCriteria: retrievedSnapshot.getSnapshotListByCriteria,
    handleActions: retrievedSnapshot.handleActions,
    setSnapshot: retrievedSnapshot.setSnapshot,
   
    setSnapshots: retrievedSnapshot.setSnapshots,
    takeLatestSnapshot: retrievedSnapshot.takeLatestSnapshot,
    updateSnapshot: retrievedSnapshot.updateSnapshot,
    executeSnapshotAction: retrievedSnapshot.executeSnapshotAction,
    
    events: retrievedSnapshot.events,
    meta: retrievedSnapshot.meta,
    setSnapshotCategory: retrievedSnapshot.setSnapshotCategory,
    getSnapshotCategory: retrievedSnapshot.getSnapshotCategory,
   
    getSnapshotData: retrievedSnapshot.getSnapshotData,
    deleteSnapshot: retrievedSnapshot.deleteSnapshot,
    getSnapshots: retrievedSnapshot.getSnapshots,
    handleSnapshotSuccess: retrievedSnapshot.handleSnapshotSuccess,
    
    getTimestamp: retrievedSnapshot.getTimestamp,
    stores: retrievedSnapshot.stores,
    onSnapshot: retrievedSnapshot.onSnapshot,
    onSnapshots: retrievedSnapshot.onSnapshots,
    childIds: retrievedSnapshot.childIds,
   
  };
  

  return {
    key: retrievedSnapshot.id,
    state: [snapshot],
    store: null,
    stores: (storeProps: SnapshotStoreProps<T, K>) => [], // Return an array or null
    findIndex: () => -1,
    splice: () => [],
    id: retrievedSnapshot.id,
    topic: '',
    date: retrievedSnapshot.timestamp,
    config: {} as Promise<SnapshotStoreConfig<T, K>>,
    title: '',
    category: retrievedSnapshot.category,
    description: '',
    isActive: true,
    version: {} as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    status: StatusType.Inactive,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: '',
    permissions: [],
    settings: {},
    metadata: {
      metadataEntries: {}
    },
    references: [],
    history: [],
    labels: [],

    tags: undefined,
    comments: [],
    attachments: [],
    events: {
      eventRecords: {} as Record<string, any[]> & CombinedEvents<T, K>,
      callbacks: {
        default: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          // Convert Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> to a format that can be used with Snapshots<T, K>
          const snapshotsMap = convertSnapshotToMap(snapshot);
          
          // Assuming convertSnapshotToMap returns a Map or similar structure
          // If Snapshots<T, K> is a Map, this will be appropriate
          const snapshots: Map<string, any> = snapshotsMap;
      
          // Return the appropriate result or handle the snapshots as needed
          return snapshots;
        }]
      },
      subscribers: [],
      eventIds: []
    },
    actions: [],
    log: [],
    versionHistory: [],
    archived: false,
    lastAccessed: new Date(),
    createdBy: '',
    updatedBy: '',
    parentId: '',
    childIds: [],
    dependencies: [],
    relatedItems: [],
    customFields: {},

    priority: PriorityTypeEnum.Low,
    dueDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    progress: 0,
    completionDate: new Date(),
    reviewStatus: '',
    approvalStatus: '',
    feedback: '',
    notes: '',
    metaData: {},
    message: retrievedSnapshot.message,
    timestamp: retrievedSnapshot.timestamp,
    eventRecords: retrievedSnapshot.events?.eventRecords ? retrievedSnapshot.events?.eventRecords : null,
    type: 'snapshot',
    snapshots: [],
    snapshotConfig: {} as SnapshotStoreConfig<T, K>,
    meta: {},
    snapshotMethods: [],
    getSnapshotsBySubscriber: () => { },
    getSnapshotsBySubscriberSuccess: () => { },
    getSnapshotsByTopic: () => { },
    getSnapshotsByTopicSuccess: () => { },
    getSnapshotsByCategory: () => { },
    getSnapshotsByCategorySuccess: () => { },
    getSnapshotsByKey: () => { },
    getSnapshotsByKeySuccess: () => { },
    getSnapshotsByPriority: () => { },
    getSnapshotsByPrioritySuccess: () => { },
    getStoreData: () => { },
    updateStoreData: () => { },
    updateDelegate: () => { },
    getSnapshotContainer: (
      snapshotFetcher: (
      id: string | number
    ) => Promise<{
      category: string;
      timestamp: string;
      id: string;
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K>;
      subscribers: Subscriber<T, K>[];
      data: T;
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      unsubscribe: () => void;
      addSnapshotFailure: (
        date: Date, 
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
         payload: { error: Error; }
      ) => void;
      createSnapshotSuccess: (
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload?: { data?: any }
      ) => void;
      createSnapshotFailure: (
        date: Date,
        snapshotId: string, 
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        payload: { error: Error; }
      ) => void;
      updateSnapshotSuccess: (
        snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload?: { data?: any; } | undefined
      ) => void;
      batchUpdateSnapshotsSuccess: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>) => void;
      batchUpdateSnapshotsFailure: (
        date: Date, 
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>,
         snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payload: { error: Error; }
      ) => void;
      batchUpdateSnapshotsRequest: (
        snapshotData: (subscribers: SubscriberCollection<T, K>) => Promise<{
          subscribers: SubscriberCollection<T, K>;
          snapshots: Snapshots<T, K>
        }>,
        snapshotManager: SnapshotManager<T, K>
      ) => Promise<void>;
      createSnapshots: (
        id: string,
        snapshotId: string,
        snapshots: Snapshots<T, K>,
        snapshotManager: SnapshotManager<T, K>,
        payload: CreateSnapshotsPayload<T, K>,
        callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
        snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
        category?:  Category,
        categoryProperties?: string | CategoryProperties,
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
      batchTakeSnapshot: (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      batchTakeSnapshotsRequest: (snapshotIds: string[], snapshots: Snapshots<T, K>) => Promise<void>;
      deleteSnapshot: (id: string) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshot<T,K>[]>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;
      batchFetchSnapshotsFailure: (
        date: Date, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }
      ) => void;

      
      filterSnapshotsByStatus: (status: string) => Snapshots<T, K>
      filterSnapshotsByCategory: (category: string) => Snapshots<T, K>;
      filterSnapshotsByTag: (tag: string) => Snapshots<T, K>;
      fetchSnapshot: ( 
        callback: (
          snapshotId: string,
          payload: FetchSnapshotPayload<T, K> | undefined,
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          payloadData: T |  BaseData<any>,
          category?: Category,
          categoryProperties: CategoryProperties | undefined,
          timestamp: Date,
          data: T,
          delegate: SnapshotWithCriteria<T, K>[]
        ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  
      getSnapshotData: (
        id: string | number | undefined,
        snapshotId: string,
        snapshotData: T,
        category?: Category,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<T, K>
      ) => Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
      setSnapshotCategory: (id: string, newCategory: string | Category) => void;
      getSnapshotCategory: (id: string) => Category | undefined;
      getSnapshots: (criteria: any) => Snapshots<T, K>;
      getAllSnapshots: (
        snapshotId: string,
        snapshotData: T,
        timestamp: string,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category?: Category,        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<T, K>,
        data: T,
        dataCallback?: (
          subscribers: Subscriber<T, K>[],
          snapshots: Snapshots<T, K>
        ) => Promise<SnapshotUnion<T, K, Meta>[]>
      ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
      addData: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
      setData: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
      getData: (id: string) => T;
  
      dataItems: T[];
      getStore: (
        storeId: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotId: string | null,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotStoreConfig: SnapshotStoreConfig<T, K>,
        type: string,
        event: Event
      ) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      addStore: (storeId: number, snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      removeStore: (storeId: number, store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event) => void;
      stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      configureSnapshotStore: (config: any) => void;
  
      onSnapshot: (
        snapshotId: string, 
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        type: string,
         event: Event, 
         callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
      ) => void;
      onSnapshots: (
        snapshotId: string, snapshots: Snapshots<T, K>, 
        type: string,
        event: Event,
         callback: (snapshots: Snapshots<T, K>) => void
      ) => void;
      events: any; // Adjust type as needed
      notify: (message: string) => void;
      notifySubscribers: (message: string, subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<T, any>>) => Subscriber<T, K>[];
     
      parentId: string;
      childIds?: K[];
      getParentId: (id: string, snapshot:Snapshot<BaseData, T>) => string;
      getChildIds: (id: string, childSnapshot: Snapshot<BaseData, K>) => string[];
      addChild: (parentId: string, childId: string) => void;
      removeChild: (parentId: string, childId: string) => void;
      getChildren: (id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      hasChildren: (id: string) => boolean;
      isDescendantOf: (childId: string, parentId: string, parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  
      generateId: () => string;
      compareSnapshots: (snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        differences: Record<string, { snapshot1: any; snapshot2: any }>;
        versionHistory: {
          snapshot1Version: number;
          snapshot2Version: number;
        };
      } | null;
      compareSnapshotItems: (item1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, item2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, keys: string[]) => {
        itemDifferences: Record<string, {
          snapshot1: any;
          snapshot2: any;
          differences: {
            [key: string]: { value1: any; value2: any };
          };
        }>;
      } | null;
      mapSnapshot: (
        snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        mapFn: (item: T) => T
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

      mapSnapshotWithDetails: (
        storeId: number, 
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        snapshotId: string, 
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        type: string, 
        event: Event, 
        callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

      compareSnapshotState: (snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,) => boolean;
  
      getConfigOption: (key: string) => any;
      getTimestamp: () => Date;
      getInitialState: () => any;
      getStores: () => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      
      getSnapshotId: (key: string | T, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => unknown;
      handleSnapshotSuccess: (message: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
        }> | undefined
      ): Promise<SnapshotContainer<T, K>> => {
        return new Promise(async (resolve, reject) => {
          const snapshotId = getSnapshotId(snapshotFetcher).toString();
          const snapshotData = await snapshotFetcher(snapshotId);
      
          if (snapshotData) {
            const snapshotContainer: SnapshotContainer<T, K> = {
              id: snapshotData.id,
              category: snapshotData.category,
              timestamp: snapshotData.timestamp,
      
              snapshotStore: snapshotData.snapshotStore,
              data: snapshotData.data,
              snapshotsArray: Array.isArray(snapshotData.snapshots) ? snapshotData.snapshots : [],
              snapshotsObject: Array.isArray(snapshotData.snapshots)
                ? snapshotData.snapshots.reduce((acc, snap) => {
                      if (snap.id) {
                        acc[snap.id] = snap;
                      }
                      return acc;
                    }, {} as SnapshotsObject<T, K>)
                    : {},
              
              newData: snapshotData.newData,
              unsubscribe: snapshotData.unsubscribe,
              addSnapshotFailure: snapshotData.addSnapshotFailure,
              createSnapshotSuccess: snapshotData.createSnapshotSuccess,
              createSnapshotFailure: snapshotData.createSnapshotFailure,
              updateSnapshotSuccess: snapshotData.updateSnapshotSuccess,
              batchUpdateSnapshotsSuccess: snapshotData.batchUpdateSnapshotsSuccess,
              batchUpdateSnapshotsFailure: snapshotData.batchUpdateSnapshotsFailure,
              batchUpdateSnapshotsRequest: snapshotData.batchUpdateSnapshotsRequest,
              createSnapshots: snapshotData.createSnapshots,
              batchTakeSnapshot: snapshotData.batchTakeSnapshot,
              batchTakeSnapshotsRequest: snapshotData.batchTakeSnapshotsRequest,
              deleteSnapshot: snapshotData.deleteSnapshot,
              batchFetchSnapshots: snapshotData.batchFetchSnapshots,
              batchFetchSnapshotsSuccess: snapshotData.batchFetchSnapshotsSuccess,
              batchFetchSnapshotsFailure: snapshotData.batchFetchSnapshotsFailure,
              filterSnapshotsByStatus: snapshotData.filterSnapshotsByStatus,
              filterSnapshotsByCategory: snapshotData.filterSnapshotsByCategory,
              filterSnapshotsByTag: snapshotData.filterSnapshotsByTag,
              fetchSnapshot: snapshotData.fetchSnapshot,
      
              getSnapshotData: snapshotData.getSnapshotData,
              setSnapshotCategory: snapshotData.setSnapshotCategory,
              getSnapshotCategory: snapshotData.getSnapshotCategory,
              getSnapshots: snapshotData.getSnapshots,
              getAllSnapshots: snapshotData.getAllSnapshots,
              addData: snapshotData.addData,
              setData: snapshotData.setData,
              getData: snapshotData.getData,
      
              dataItems: snapshotData.dataItems,
              getStore: snapshotData.getStore,
              addStore: snapshotData.addStore,
              removeStore: snapshotData.removeStore,
              stores: snapshotData.stores ?? snapshotData.stores,
              configureSnapshotStore: snapshotData.configureSnapshotStore,
      
              onSnapshot: snapshotData.onSnapshot,
              onSnapshots: snapshotData.onSnapshots,
              events: snapshotData.events,
              notify: snapshotData.notify,
              notifySubscribers: snapshotData.notifySubscribers,
              subscribers: snapshotData.subscribers,
      
              parentId: snapshotData.parentId,
              childIds: snapshotData.childIds,
              getParentId: snapshotData.getParentId,
              getChildIds: snapshotData.getChildIds,
              addChild: snapshotData.addChild,
              removeChild: snapshotData.removeChild,
              getChildren: snapshotData.getChildren,
              hasChildren: snapshotData.hasChildren,
              isDescendantOf: snapshotData.isDescendantOf,
      
              generateId: snapshotData.generateId,
              compareSnapshots: snapshotData.compareSnapshots,
              compareSnapshotItems: snapshotData.compareSnapshotItems,
              mapSnapshot: snapshotData.mapSnapshot,
              mapSnapshotWithDetails: snapshotData.mapSnapshotWithDetails,
              compareSnapshotState: snapshotData.compareSnapshotState,
      
              getConfigOption: snapshotData.getConfigOption,
              getTimestamp: snapshotData.getTimestamp,
              getInitialState: snapshotData.getInitialState,
              getStores: snapshotData.getStores,
              getSnapshotId: snapshotData.getSnapshotId,
              handleSnapshotSuccess: snapshotData.handleSnapshotSuccess,
      
              snapshot: (
                id,
                 snapshotId, 
                 snapshotData,
                  category, 
                categoryProperties,
                dataStoreMethods
              ) => {
                if (!snapshotData) {
                  // Handle the case where snapshotData is undefined
                  return null; // or throw an error, or return a default Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
                }
              
                const receivedSnapshotData = snapshotData.snapshot ? snapshotData : undefined
                return receivedSnapshotData
              },
              snapshotData: (id, snapshotId,snapshotData, category, categoryProperties, dataStoreMethods) => {
                return Promise.resolve(snapshotData.snapshot);
              },
            };
      
            resolve(snapshotContainer);
          } else {
            reject(new Error("Snapshot container not found"));
          }
        })
      },
    getSnapshotVersions: () => { },
    createSnapshot: () => { },
    deleteSnapshot: () => { },
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, K>,
    getSnapshotItems: (): (SnapshotStoreConfig<T, K> | SnapshotItem<T, K>)[] => [],
    dataStore: {} as  InitializedDataStore<T>,
    mapDataStore: {} as T | Map<string, DataStore<T, K>> | null | undefined,
    initialState: {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotItems: [],
    nestedStores: [],
    snapshotIds: [],
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
    delegate: [],
    findSnapshotStoreById: (storeId: number) => null as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    saveSnapshotStore: async (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
    subscriberId: '',
    length: 0,
    content: '',
    value: null,
    todoSnapshotId: '',
    snapshotStore: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: [],
    newData: null,
    handleSnapshotOperation: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      operation: SnapshotOperation<T, K>,
      operationType: SnapshotOperationType
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => { 
      return new Promise((resolve, reject) => { 
        resolve(snapshot);
      })
    },
    getStore: (
      storeId: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      type: string,
      event: Event
    ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {},
    addStore: (
      storeId: number, 
      snapshotId: string, 
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string, 
      event: Event
    ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => { },
    getCustomStore: () => {},
    addSCustomStore: () => {},
    removeStore: () => {},
    onSnapshot: () => {},
    getData: (id: number) => {
      return {} as T
    },
    getDataStore: async () => {
      return Promise.resolve(snapshotData.dataStore);
    },
    addSnapshotToStore: () => {},
    addSnapshotItem: () => {},
    addNestedStore: () => {},
    defaultSubscribeToSnapshots: () => {},
    defaultCreateSnapshotStores: (
      id: string,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotManager: SnapshotManager<T, K>,
      payload: CreateSnapshotStoresPayload<T, K>,
      callback: (snapshotStores?: SnapshotStoreReference<T, K>[]) => void | null,
      snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      category?:  Category,
      snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[]
    ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null => {
      try {
        // Step 1: Validate input parameters
        if (!snapshot || !snapshotStore || !snapshotManager || !payload) {
          console.error("Invalid parameters provided to defaultCreateSnapshotStores");
          return null;
        }
    
        // Step 2: Create new snapshot stores
        const newSnapshotStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
        
        // Example logic: Creating snapshot stores based on the payload
        payload.snapshots.forEach(snapshotData => {
          const newStore = snapshotManager.createSnapshotStore({
            id: snapshotId,
            data: snapshotData,
            category: category ?? 'default', // Use provided category or default
            config: snapshotDataConfig ? snapshotDataConfig[0] : undefined // Use provided config if available
          });
    
          newSnapshotStores.push(newStore);
        });
    
        // Step 3: Process existing snapshot store data if provided
        if (snapshotStoreData) {
          snapshotStoreData.forEach(store => {
            // Example logic: Update or merge existing stores
            const updatedStore = snapshotManager.updateSnapshotStore(store);
            newSnapshotStores.push(updatedStore);
          });
        }
    
        // Step 4: Invoke the callback with the created snapshot stores
        if (callback) {
          callback(newSnapshotStores);
        }
    
        // Step 5: Return the created snapshot stores
        return newSnapshotStores;
      } catch (error) {
        console.error("Error in defaultCreateSnapshotStores:", error);
        return null;
      }
    },
    createSnapshotStores: () => {},
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T, K>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null
    ): null => {
      // Implement the subscription logic here...
    
      // At the end of the function, return null to satisfy the expected return type
      return null;
    },
    subscribeToSnapshot: () => {},
    defaultOnSnapshots: () => {},
    onSnapshots: (
      snapshotId: string,
      snapshots: Snapshots<T, K>,
      type: string,
      event: Event,
      callback: (snapshots: Snapshots<T, K>) => void
    ): Promise<void | null> => {
      return new Promise((resolve) => {
        // Step 1: Handle the event or type if necessary
        switch (type) {
          case 'UPDATE':
            console.log(`Handling update event for snapshotId: ${snapshotId}`);
            break;
          case 'DELETE':
            console.log(`Handling delete event for snapshotId: ${snapshotId}`);
            break;
          default:
            console.warn(`Unknown event type: ${type}`);
        }
    
        // Step 2: Process snapshots if necessary (e.g., filtering, transformation)
        const processedSnapshots = Array.isArray(snapshots)
        ? snapshots.map((snapshot: SnapshotUnion<T, K, Meta>) => ({
            ...snapshot,
            updatedAt: new Date() // Example transformation: adding a timestamp
          }))
        : [];
  
    
        // Step 3: Invoke the callback with the processed snapshots
        callback(processedSnapshots);
    
        // Step 4: Optionally, notify other subscribers or update internal state
        if (typeof this.notifySubscribers === "function") {
          this.notifySubscribers(snapshotId);       
         } 
          else {
          console.warn("notifySubscribers method is not defined.");
        }    
        
        // Resolve the promise to match the return type
        resolve();
      });
    },
    


    transformSubscriber: (sub: Subscriber<T, K>) => {},
    isSnapshotStoreConfig: (item: any) => {},
    transformDelegate: () => {},
    initializedState: {},
    transformedDelegate: {},
    getSnapshotIds: () => [],
    getNestedStores: () => [],
    getAllKeys: () => [],
    mapSnapshot: () => {},
    getAllItems: () => [],
    addData: () => {},
    addDataStatus: () => {},
    removeData: () => {},
    updateData: () => {},
    updateDataTitle: () => {},
    updateDataDescription: () => {},
    updateDataStatus: () => {},
    addDataSuccess: () => {},
    getDataVersions: () => {},
    updateDataVersions: () => {},
    getBackendVersion: () => '',
    getFrontendVersion: () => '',
    fetchData: () => {},
    defaultSubscribeToSnapshot: () => {},
    handleSubscribeToSnapshot: () => {},
    snapshot: {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    removeItem: () => {},
    getSnapshot: (
      snapshot: (id: string) =>
        | Promise<{
          category?: Category;
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
          }>
        | undefined
    ) => {},
    getSnapshotSuccess: () => {},
    getSnapshotId: () => '',
    getItem: async (key: T): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
    setItem: () => {},
    addSnapshotFailure: (
      date: Date, 
      snapshotId: string | number | null,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
       payload: { error: Error; }
    ) => {},
    addSnapshotSuccess: () => {},
    getParentId: () => '',
    getChildIds: () => [],
    compareSnapshotState: (state1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, state2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,) => false,
    deepCompare: () => false,
    shallowCompare: () => false,
    getDataStoreMethods: () => ({}),
    getDelegate: () => ({}),
    determineCategory: () => '',
    determineSnapshotStoreCategory: () => '',
    determinePrefix: () => '',
    updateSnapshot: (
      snapshotId: string,
        data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        events: Record<string, CalendarManagerStoreClass<T, K>[]>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: RealtimeDataItem[],
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: UpdateSnapshotPayload<T>,
        store: SnapshotStore<any, K>
    ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> => {},
    updateSnapshotSuccess: () => {},
    updateSnapshotFailure: () => {},
    removeSnapshot: () => {},
    clearSnapshots: () => {},
    addSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotId: string,
      subscribers: SubscriberCollection<T, K> | undefined
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
    createInitSnapshot: (
      id: string, 
      initialData: T,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      category: Category
    ): Promise<SnapshotWithCriteria<T, K>> => {},
    createSnapshotSuccess: () => {},
    clearSnapshotSuccess: () => {},
    clearSnapshotFailure: () => {},
    createSnapshotFailure: async () => {},
    setSnapshotSuccess: () => {},
    setSnapshotFailure: () => {},
    updateSnapshots: () => {},
    updateSnapshotsSuccess: () => {},
    updateSnapshotsFailure: () => {},
    initSnapshot: () => {},
    takeSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers?: Subscriber<T, K>[] | undefined
    ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> => {},
    takeSnapshotSuccess: () => {},
    takeSnapshotsSuccess: () => {},
    configureSnapshotStore: () => {},
    flatMap: () => [],
    setData: () => {},
    getState: () => ({}),
    setState: () => {},
    validateSnapshot: () => true,
    handleSnapshot: (
      message: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshotId: string
    ) => {},
    handleActions: () => {},
    setSnapshot: () => {},
    transformSnapshotConfig: () => ({}),
    setSnapshotData: (
      id: string,
      snapshotId: string,
      snapshot: T | null,
      snapshotData: T,
      category?: Category,      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Map<string, T>,
      subscribers: Subscriber<T, K>[],
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>  | null,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {},
    setSnapshots: () => {},
    clearSnapshot: () => {},
    mergeSnapshots: () => {},
    reduceSnapshots: () => {},
    sortSnapshots: () => [],
    filterSnapshots: () => [],
    mapSnapshotsAO: () => [],
    mapSnapshots: () => [],
    findSnapshot: () => null,
    getSubscribers: () => [],
    notify: () => {},
    notifySubscribers: () => {},
    subscribe: () => {},
    unsubscribe: () => {},
    fetchSnapshot: () => {},
    fetchSnapshotSuccess: () => {},
    fetchSnapshotFailure: (
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      date: Date | undefined,
      payload: { error: Error }
    ) => {},
    getSnapshots: () => [],
    getAllSnapshots: () => [],
    getSnapshotStoreData: () => ({}),
    generateId: () => '',
    batchFetchSnapshots: () => {},
    batchTakeSnapshotsRequest: () => {},
    batchUpdateSnapshotsRequest: () => {},
    batchFetchSnapshotsSuccess: () => {},
    batchFetchSnapshotsFailure: () => {},
    batchUpdateSnapshotsSuccess: () => {},
    batchUpdateSnapshotsFailure: () => {},
    batchTakeSnapshot: () => {},
    handleSnapshotSuccess: () => {},
    [Symbol.iterator]: function* () { yield* []; },
  }
};
 
 // Define a function to convert SnapshotStore<Snapshot<Data, Data>> to RetrievedSnapshot<SnapshotDataResponse>
const convertToRetrievedSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const singleSnapshot = snapshotStore.state?.[0];

  if (!singleSnapshot) {
    throw new Error('No snapshot available');
  }

  const retrievedSnapshot: RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: singleSnapshot.key || '',
    category: singleSnapshot.category ?? '',

    timestamp: singleSnapshot.timestamp ? new Date(singleSnapshot.timestamp) : new Date(),
    data: singleSnapshot.data ?? null,
    callbacks: singleSnapshot.callbacks,
    initialConfig: singleSnapshot.initialConfig,
    removeSubscriber: singleSnapshot.removeSubscriber,
    onInitialize: singleSnapshot.onInitialize,
    onError: singleSnapshot.onError,
    snapshot: singleSnapshot.snapshot,
    setCategory: singleSnapshot.setCategory,
    applyStoreConfig: singleSnapshot.applyStoreConfig,
    
    // Additional properties from SnapshotDataResponse
  };

  return retrievedSnapshot;
};


export const RetrievedSnapshotData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(): Promise<RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  return new Promise<RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(async (resolve, reject) => {
    try {
      // Fetch snapshot data from the API endpoint
      const response = await axiosInstance.get<T, K>(SNAPSHOT_DATA_API_URL);

      // Validate the response data
      if (!isValidSnapshotDataResponse(response.data)) {
        throw new Error('Invalid snapshot data response');
      }

      // Create data map or handle appropriately
      const dataMap = new Map<string, T>();

      // Add your data to the map
      dataMap.set(response.data.id.toString(), {
        ...response.data,
        _id: '', // Adjust based on your structure
        analysisResults: [],
        analysisType: AnalysisTypeEnum.DESCRIPTIVE,
        timestamp: response.data.timestamp,
      });

      // Construct the retrieved snapshot object
      const snapshotData: RetrievedSnapshot<SnapshotDataResponse<T, K>, K> = {
        id: response.data.id.toString(),
        timestamp: new Date(response.data.timestamp),
        category: response.data.category,
        data: dataMap,
        responseData: response.data.responseData,
        
        callbacks: response.data.callbacks,
        deleted: response.data.deleted,
        
        initialState: response.data.initialState,
        initialConfig: response.data.initialConfig,
        
        removeSubscriber: response.data.removeSubscriber,
        onInitialize: response.data.onInitialize,
        onError: response.data.onError,
        snapshot: response.data.snapshot,
        setCategory: response.data.setCategory,
        applyStoreConfig: response.data.applyStoreConfig,
       

      };

      resolve(snapshotData);
    } catch (error) {
      console.error('Error retrieving snapshot data:', error);
      reject(error);
    }
  });
};

// Helper function to validate the snapshot data response
function isValidSnapshotDataResponse(data: any): data is SnapshotDataResponse<T, K> {
  // Add your validation logic here
  // For example, check if the required properties exist and have the correct types
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'number' &&
    typeof data.category === 'string' &&
    typeof data.timestamp === 'string'
  );
}



export default RetrievedSnapshotData;

// Define `retrievedSnapshot` to return an instance of `RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`
const retrievedSnapshot: <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>() => RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = () => {
  // Assuming `RetrievedSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>` is not a function but rather a data structure
  const snapshotData: RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    // Populate with necessary properties according to RetrievedSnapshot structure
    responseData: {} as SnapshotDataResponse<T, K>, // Adjust as per your response structure
    // Add other properties as needed
  };

  return snapshotData; // Correctly return the `RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>` instance
};

const retrieveData = async () => {
   
  const snapshot = await retrieveSnapshotData(snapshotId);
  return snapshot;
};

export const retrieveSnapshotData = <
  T extends BaseData<any>, K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(id: string
): Promise<RetrievedSnapshot<SnapshotDataResponse<T, K>, K> | null> => {
  return new Promise<RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(
    async (resolve, reject) => {
    try {
      const response = await axiosInstance.get<SnapshotDataResponse<T, K>>(`${SNAPSHOT_DATA_API_URL}/${id}`);

      // Ensure response.data is of type SnapshotDataResponse<T, K>
      const snapshotData: RetrievedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        timestamp: new Date(response.data.timestamp),
        category: response.data.category,
        data: null, // Adjust this as per your data structure
        snapshotStoreConfig: response.data.snapshotStoreConfig,
        getSnapshotItems: response.data.getSnapshotItems,
        defaultSubscribeToSnapshots: response.data.defaultSubscribeToSnapshots,
       
        transformSubscriber: response.data.transformSubcriber,
        responseData: response.data.responseData,
        callbacks: response.data.callbacks,
        initialState: response.data.initialState,
        isCore: response.data.isCore,
       

      };

      resolve(snapshotData);
    } catch (error) {
      console.error("Error retrieving snapshot data by id:", error);
      reject(error);
    }
  });
};
export type { RetrievedSnapshot, SnapshotDataResponse };


