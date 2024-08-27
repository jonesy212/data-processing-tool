import { Snapshot, Snapshots, SnapshotUnion, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import axiosInstance from '../api/axiosInstance';
import { CombinedEvents } from '../components/hooks/useSnapshotManager';
import { Data } from "../components/models/data/Data";
import { PriorityTypeEnum, StatusType } from '../components/models/data/StatusType';
import { AnalysisTypeEnum } from "../components/projects/DataAnalysisPhase/AnalysisType";
import { DataStoreWithSnapshotMethods } from '../components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { SnapshotOperation, SnapshotOperationType } from '../components/snapshots/SnapshotActions';
import { SnapshotItem } from '../components/snapshots/SnapshotList';
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '../components/snapshots/SnapshotStoreConfig';
import { VideoData } from "../components/video/Video";
import { CategoryProperties } from '../pages/personas/ScenarioBuilder';
import { DataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Subscriber } from '../components/users/Subscriber';
import { Category } from "../components/libraries/categories/generateCategoryProperties";
import { T, K } from "../snapshots/SnapshotConfig";

import { convertSnapshotToMap } from "../components/typings";
// Define the API endpoint for retrieving snapshot data
const SNAPSHOT_DATA_API_URL = "https://example.com/api/snapshot";

type SnapshotData<T extends Data, K extends Data> = T | Map<string, Snapshot<T, K>> | null | undefined;

// Define the type for the response data
interface SnapshotDataResponse<T extends Data, K extends Data>
  extends Snapshot<T, K> {
 id: number;
  timestamp: Date;
  videoData: VideoData;
  category: string
  // Other properties...
}

// Define the Snapshot interface including the responseData property
interface RetrievedSnapshot<T extends Data, K extends Data>
  extends Snapshot<T, K>{
  id: string;
  timestamp: string | Date;
  category?: Category;
  categoryProperties?: CategoryProperties;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  callbacks: Record<string, Array<(snapshot: Snapshot<T, K>) => void>>;
}



// Define a function to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot<Data>>

// Define a function to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot<Data>>
const convertToSnapshotStore = <T extends Data, K extends Data>(
  retrievedSnapshot: RetrievedSnapshot<T, K>,
  snapshots: any, 
  snapshotConfig: any, 
  meta: any, 
  snapshotMethods: any, 
  getSnapshotsBySubscriber: any,
  getSnapshotsBySubscriberSuccess: any,
  getSnapshotsByTopic: any,
  getSnapshotsByTopicSuccess: any,
  getSnapshotsByCategory: any,
  getSnapshotsByCategorySuccess: any,
  getSnapshotsByKey: any,
  getSnapshotsByKeySuccess: any,
  getSnapshotsByPriority: any,
  getSnapshotsByPrioritySuccess: any,
  getStoreData: any,
  updateStoreData: any,
  updateDelegate: any,
  getSnapshotContainer: any,
  getSnapshotVersions: any,
  createSnapshot: any,
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
  getStore: any,
  addStore: any,
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
  determineCategory: any, // Placeholder
  determineSnapshotStoreCategory: any, // Placeholder
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
  initSnapshot: any, // Placeholder
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
): SnapshotStore<T, K> => {
  // Create the Snapshot object from retrievedSnapshot
  const snapshot = {
    // Core Snapshot Properties
    id: retrievedSnapshot.id,
    parentId: retrievedSnapshot.parentId,
    label: retrievedSnapshot.label,
    timestamp: retrievedSnapshot.timestamp,
  
    // Category
    category: retrievedSnapshot.category,
    setCategory: retrievedSnapshot.setCategory,
    determineCategory: retrievedSnapshot.determineCategory,
  
    // Data
    data: retrievedSnapshot.data as T | Map<string, Snapshot<T, K>> | null | undefined,
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
    subscribeToSnapshot: retrievedSnapshot.subscribeToSnapshot,
    unsubscribeFromSnapshot: retrievedSnapshot.unsubscribeFromSnapshot,
    unsubscribeFromSnapshots: retrievedSnapshot.unsubscribeFromSnapshots,
    subscribeToSnapshotsSuccess: retrievedSnapshot.subscribeToSnapshotsSuccess,
    addSnapshotSubscriber: retrievedSnapshot.addSnapshotSubscriber,
    removeSnapshotSubscriber: retrievedSnapshot.removeSnapshotSubscriber,
    subscribeToSnapshotList: retrievedSnapshot.subscribeToSnapshotList,
    defaultSubscribeToSnapshots: retrievedSnapshot.defaultSubscribeToSnapshots,
    defaultSubscribeToSnapshot: retrievedSnapshot.defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot: retrievedSnapshot.handleSubscribeToSnapshot,
    getSubscribers: retrievedSnapshot.getSubscribers,
    notify: retrievedSnapshot.notify,
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
  };
  

  return {
    key: retrievedSnapshot.id,
    state: [snapshot],
    store: null,
    stores: null,
    findIndex: () => -1,
    splice: () => [],
    id: retrievedSnapshot.id,
    topic: '',
    date: retrievedSnapshot.timestamp,
    config: [] as SnapshotStoreConfig<T, K>[],
    title: '',
    category: retrievedSnapshot.category,
    description: '',
    isActive: true,
    version: {} as Version,
    status: StatusType.Inactive,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: '',
    permissions: [],
    settings: {},
    metadata: {},
    references: [],
    history: [],
    labels: [],

    tags: undefined,
    comments: [],
    attachments: [],
    events: {
      eventRecords: {} as Record<string, any[]> & CombinedEvents<T, K>,
      callbacks: {
        default: [(snapshot: Snapshot<T, K>) => {
          // Convert Snapshot<T, K> to a format that can be used with Snapshots<T>
          const snapshotsMap = convertSnapshotToMap(snapshot);
          
          // Assuming convertSnapshotToMap returns a Map or similar structure
          // If Snapshots<T> is a Map, this will be appropriate
          const snapshots: Snapshots<T> = snapshotsMap;
      
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
    eventRecords: retrievedSnapshot.events?.eventRecords ? retrievedSnapshot.events?.eventRecords : undefined,
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
    getSnapshotContainer: (snapshotFetcher: (
      id: string | number
    ) => Promise<{
      category: string;
      timestamp: string;
      id: string;
      snapshotStore: SnapshotStore<T, K>;
      snapshot: Snapshot<T, K>;
      snapshots: Snapshots<T>;
      subscribers: Subscriber<T, K>[];
      data: T;
      newData: T;
      unsubscribe: () => void;
      addSnapshotFailure: (error: Error) => void;
      createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
      createSnapshotFailure: (error: Error) => void;
      updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
      batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T>) => void;
      batchUpdateSnapshotsFailure: (error: Error) => void;
      batchUpdateSnapshotsRequest: (snapshots: Snapshots<T>) => void;
      createSnapshots: (snapshots: Snapshots<T>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots<T>) => void;
      deleteSnapshot: (id: string) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots<T>) => void;
      batchFetchSnapshotsFailure: (error: Error) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots<T>;
      filterSnapshotsByCategory: (category: string) => Snapshots<T>;
      filterSnapshotsByTag: (tag: string) => Snapshots<T>;
      fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  
      getSnapshotData: (id: string) => T;
      setSnapshotCategory: (id: string, category: string) => void;
      getSnapshotCategory: (id: string) => string;
      getSnapshots: (criteria: any) => Snapshots<T>;
      getAllSnapshots: () => Snapshots<T>;
      addData: (id: string, data: T) => void;
      setData: (id: string, data: T) => void;
      getData: (id: string) => T;
  
      dataItems: () => T[];
      getStore: (id: string) => SnapshotStore<T, K>;
      addStore: (store: SnapshotStore<T, K>) => void;
      removeStore: (id: string) => void;
      stores: () => SnapshotStore<T, K>[];
      configureSnapshotStore: (config: any) => void;
  
      onSnapshot: (callback: (snapshot: Snapshot<T, K>) => void) => void;
      onSnapshots: (callback: (snapshots: Snapshots<T>) => void) => void;
      events: any; // Adjust type as needed
      notify: (message: string) => void;
      notifySubscribers: (message: string) => void;
      subscribers: Subscriber<T, K>[];
  
      parentId: string;
      childIds: string[];
      getParentId: (id: string) => string;
      getChildIds: (id: string) => string[];
      addChild: (parentId: string, childId: string) => void;
      removeChild: (parentId: string, childId: string) => void;
      getChildren: (id: string) => string[];
      hasChildren: (id: string) => boolean;
      isDescendantOf: (childId: string, parentId: string) => boolean;
  
      generateId: () => string;
      compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => number;
      compareSnapshotItems: (item1: T, item2: T) => number;
      mapSnapshot: (snap: Snapshot<T, K>, mapFn: (item: T) => T) => Snapshot<T, K>;
      compareSnapshotState: (state1: any, state2: any) => number;
  
      getConfigOption: (key: string) => any;
      getTimestamp: () => string;
      getInitialState: () => any;
      getStores: () => SnapshotStore<T, K>[];
      getSnapshotId: (snapshot: Snapshot<T, K>) => string;
      handleSnapshotSuccess: (message: string) => void;
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
                    }, {} as SnapshotsObject<T>)
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
              stores: snapshotData.stores,
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
              compareSnapshotState: snapshotData.compareSnapshotState,
      
              getConfigOption: snapshotData.getConfigOption,
              getTimestamp: snapshotData.getTimestamp,
              getInitialState: snapshotData.getInitialState,
              getStores: snapshotData.getStores,
              getSnapshotId: snapshotData.getSnapshotId,
              handleSnapshotSuccess: snapshotData.handleSnapshotSuccess,
      
              snapshot: (id, snapshotData, category, categoryProperties, dataStoreMethods) => {
                return snapshotData.snapshot;
              },
              snapshotData: (id, snapshotData, category, categoryProperties, dataStoreMethods) => {
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
    dataStore: {} as T | DataStore<T, K> | null | undefined,
    mapDataStore: {} as T | Map<string, DataStore<T, K>> | null | undefined,
    initialState: {} as Snapshot<T, K>,
    snapshotItems: [],
    nestedStores: [],
    snapshotIds: [],
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
    delegate: [],
    findSnapshotStoreById: (storeId: number) => null as SnapshotStore<T, K> | null,
    saveSnapshotStore: async (store: SnapshotStore<T, K>) => {},
    subscriberId: '',
    length: 0,
    content: '',
    value: null,
    todoSnapshotId: '',
    snapshotStore: {} as SnapshotStore<T, K>,
    dataItems: [],
    newData: null,
    handleSnapshotOperation: (
      snapshot: Snapshot<T, K>,
      data: Map<string, Snapshot<T, K>>,
      operation: SnapshotOperation,
      operationType: SnapshotOperationType
    ): Promise<Snapshot<T, K>> => { 
      return new Promise((resolve, reject) => { 
        resolve(snapshot);
      })
    },
    getStore: () => {},
    addStore: () => {},
    getCustomStore: () => {},
    addSCustomStore: () => {},
    removeStore: () => {},
    onSnapshot: () => {},
    getData: () => {},
    getDataStore: () => {},
    addSnapshotToStore: () => {},
    addSnapshotItem: () => {},
    addNestedStore: () => {},
    defaultSubscribeToSnapshots: () => {},
    defaultCreateSnapshotStores: () => {},
    createSnapshotStores: () => {},
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T>) => Snapshot<T, K> | null,
      snapshot: Snapshot<T, K> | null = null
    ) => {},
    subscribeToSnapshot: () => {},
    defaultOnSnapshots: () => {},
    onSnapshots: () => {},
    transformSubscriber: () => {},
    isSnapshotStoreConfig: () => false,
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
    snapshot: {} as Snapshot<T, K>,
    removeItem: () => {},
    getSnapshot: (
      snapshot: (id: string) =>
        | Promise<{
          category: Category | undefined;
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K>;
          snapshotStore: SnapshotStore<T, K>;
          data: T;
          }>
        | undefined
    ) => {},
    getSnapshotSuccess: () => {},
    getSnapshotId: () => '',
    getItem: () => {},
    setItem: () => {},
    addSnapshotFailure: () => {},
    addSnapshotSuccess: () => {},
    getParentId: () => '',
    getChildIds: () => [],
    compareSnapshotState: () => false,
    deepCompare: () => false,
    shallowCompare: () => false,
    getDataStoreMethods: () => ({}),
    getDelegate: () => ({}),
    determineCategory: () => '',
    determineSnapshotStoreCategory: () => '',
    determinePrefix: () => '',
    updateSnapshot: () => {},
    updateSnapshotSuccess: () => {},
    updateSnapshotFailure: () => {},
    removeSnapshot: () => {},
    clearSnapshots: () => {},
    addSnapshot: () => {},
    createInitSnapshot: () => {},
    createSnapshotSuccess: () => {},
    clearSnapshotSuccess: () => {},
    clearSnapshotFailure: () => {},
    createSnapshotFailure: () => {},
    setSnapshotSuccess: () => {},
    setSnapshotFailure: () => {},
    updateSnapshots: () => {},
    updateSnapshotsSuccess: () => {},
    updateSnapshotsFailure: () => {},
    initSnapshot: () => {},
    takeSnapshot: () => {},
    takeSnapshotSuccess: () => {},
    takeSnapshotsSuccess: () => {},
    configureSnapshotStore: () => {},
    flatMap: () => [],
    setData: () => {},
    getState: () => ({}),
    setState: () => {},
    validateSnapshot: () => true,
    handleSnapshot: () => {},
    handleActions: () => {},
    setSnapshot: () => {},
    transformSnapshotConfig: () => ({}),
    setSnapshotData: (
      snapshotStore: SnapshotStore<T, K>,
      data: Map<string, T>,
      subscribers: Subscriber<T, K>[],
      snapshotData: Partial<SnapshotStoreConfig<T, K>>
    ) => {},
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
    fetchSnapshotFailure: () => {},
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

// Define a function to convert SnapshotStore<Snapshot<Data>> to RetrievedSnapshot<SnapshotDataResponse>


// Define a function to convert SnapshotStore<Snapshot<Data>> to RetrievedSnapshot<SnapshotDataResponse>
const convertToRetrievedSnapshot = <T extends Data, K extends Data>(
  snapshotStore: SnapshotStore<T, K>
): RetrievedSnapshot<SnapshotDataResponse<T, K>, K> => {
  // Perform the conversion here
  const singleSnapshot = snapshotStore.state?.[0]; // Assuming you're dealing with the first snapshot

  if (!singleSnapshot) {
    throw new Error('No snapshot available');
  }

  const retrievedSnapshot: RetrievedSnapshot<SnapshotDataResponse<T, K>, K> = {
    id: singleSnapshot.key ? singleSnapshot.key : undefined,
    category: singleSnapshot.category ?? '', 
    timestamp: singleSnapshot.timestamp ?? new Date(),
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


export const RetrievedSnapshotData = <T extends Data, K extends Data>(): Promise<RetrievedSnapshot<T, K> | null> => {
  return new Promise<RetrievedSnapshot<T, K> | null>(async (resolve, reject) => {
    try {
      // Fetch snapshot data from the API endpoint
      const response = await axiosInstance.get<T, K>(SNAPSHOT_DATA_API_URL);

      // Validate the response data
      if (!isValidSnapshotDataResponse(response.data)) {
        throw new Error('Invalid snapshot data response');
      }

      // Create data map or handle appropriately
      const dataMap = new Map<string, Data>();

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




const retrieveData = async () => {
  const snapshot = await RetrievedSnapshotData();
  return snapshot;
};


export const retrieveSnapshotData = <T extends Data, K extends Data>(id: string): Promise<RetrievedSnapshot<SnapshotDataResponse> | null> => {
  return new Promise<RetrievedSnapshot<SnapshotDataResponse<T,K>, K> | null>(async (resolve, reject) => {
    try {
      const response = await axiosInstance.get<SnapshotDataResponse<T,K>>(`${SNAPSHOT_DATA_API_URL}/${id}`);

      const snapshotData: RetrievedSnapshot<SnapshotDataResponse<T,K>, K> = {
        id: response.data.id.toString(),
        timestamp: new Date(response.data.timestamp),
        category: response.data.category,
        data: null, // Adjust this as per your data structure
        snapshotStoreConfig, getSnapshotItems, defaultSubscribeToSnapshots,
        transformSubscriber: response.data.transformSubcriber,
      };

      resolve(snapshotData);
    } catch (error) {
      console.error("Error retrieving snapshot data by id:", error);
      reject(error);
    }
  });
};
export type { SnapshotDataResponse, RetrievedSnapshot };