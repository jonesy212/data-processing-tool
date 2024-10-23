import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
// DetailsListStore.ts
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { makeAutoObservable } from "mobx";
import { FC } from "react";
import { Data } from "../../models/data/Data";
import { Team } from "../../models/teams/Team";
import { Phase } from "../../phases/Phase";
import SnapshotStore from "../../snapshots/SnapshotStore";
import {
    NotificationTypeEnum,
    useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CommunicationActionTypes } from "../../community/CommunicationActions";
import { Attachment } from "../../documents/Attachment/attachment";
import { DocumentStatus } from "../../documents/types";
import { DataDetails } from "../../models/data/Data";
import {
    DataStatus,
    PriorityTypeEnum,
    ProductStatus,
    StatusType,
    TaskStatus,
    TeamStatus,
    TodoStatus,
} from "../../models/data/StatusType";
import { Member, TeamMember } from "../../models/teams/TeamMembers";
import { Tag } from "../../models/tracker/Tag";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project } from "../../projects/Project";
import { SnapshotConfig, SnapshotDataType, SnapshotStoreProps, TagsRecord } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";

import { AllTypes } from "../../typings/PropTypes";
import { createSnapshotStoreOptions } from "../../typings/YourSpecificSnapshotType";
const { notify } = useNotification();

// Union type of all status enums
export type AllStatus =
  | StatusType
  | TaskStatus
  | TodoStatus
  | DataStatus
  | TeamStatus
  | DocumentStatus
  | PriorityTypeEnum
  | ProductStatus;
// Define a generic interface for details
// isActive

interface DetailsItem<T extends Data> {
  _id?: string;
  id: string | number;
  title?: string;
  type?: AllTypes;
  status?: AllStatus;
  communication?: CommunicationActionTypes;
  teammembers?: Array<TeamMember>
  description?: string | null | undefined;
  startDate?: Date;
  endDate?: Date;
  updatedAt?: Date;
  Phase?: Phase | null;
  subtitle: string;
  author?: string;
  date?: Date;
  label?: string;
  value: string;
  phase?: Phase;
  collaborators?: Member[];
  tags?:  string[] | Tag[]
  analysisResults?: DataAnalysisResult[];
  tracker?: string;
  participants?: Member[];
  // Core properties...
}

interface DetailsItemExtended extends DataDetails{
  id: string | number;
  _id?: string;
  title?: string;
  name?: string;
  isRecurring?: boolean;
  type?: AllTypes; //todo verif we match types
  status?: AllStatus; // Use enums for status property
  participants?: Member[];
  description?: string | null | undefined;
  assignedProjects?: Project[];
  analysisType?: AnalysisTypeEnum | undefined;
  isVisible?: boolean;
  query?: string;
  reassignedProjects?: {
    project: Project;
    previousTeam: Team;
    reassignmentDate: Date;
  }[];
  progress?: Progress | null;
  startDate?: Date;
  dueDate?: Date | null | undefined;

  endDate?: Date;
  phase?: Phase | null;
  isActive?: boolean;
  tags?: TagsRecord | string[] | undefined
  subtitle?: string;
  date?: Date;
  author?: string;
  // data?: T; // Make the data property optional
  teamMembers?: TeamMember[];
  communication?: CommunicationActionTypes;
  label?: string;
  value?: string;
  reminders?: string[];
  importance?: string;
  location?: string;
  attendees?: Member[];
  attachments?: Attachment[];
  notes?: string[];
  setCurrentProject?: (project: Project) => void;
  setCurrentTeam?: (team: Team) => void;
  clearCurrentProject?: () => void;
}

export interface DetailsListStore <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  details: Record<string, DetailsItemExtended[]>;
  detailsTitle: string;
  detailsDescription: string;
  detailsStatus:
    | TaskStatus.Pending
    | TaskStatus.InProgress
    | TaskStatus.Completed
    | TaskStatus.Tentative
    | TaskStatus.Confirmed
    | TaskStatus.Cancelled
    | TaskStatus.Scheduled
    | undefined;
  snapshotStore: SnapshotStore<T, Meta, K>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateDetailsTitle: (title: string, newTitle: string) => void;
  subscribe(callback: (snapshot: Snapshot<T, Meta, K>) => void): void;

  toggleDetails: (detailsId: string) => void;

  updateDetailsDescription: (id: string, description: string) => void;
  updateDetailsStatus: (
    status:
      | StatusType.InProgress
      | StatusType.Completed
      | StatusType.Tentative
      | StatusType.Confirmed
      | StatusType.Cancelled
      | StatusType.Scheduled
  ) => void;
  addDetails: (id: string, description: string) => void;
  addDetail: (newDetail: Data) => void;
  addDetailsItem: (detailsItem: DetailsItemExtended) => void;
  setDetails: (details: Record<string, DetailsItemExtended[]>) => void;
  removeDetails: (detailsId: string) => void;
  removeDetailsItems: (detailsIds: string[]) => void;
  setDynamicNotificationMessage: (message: string) => void;
}

class DetailsListStoreClass <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  implements DetailsListStore<T, Meta, K>
{
  details: Record<string, DetailsItemExtended[]> = {
    pending: [],
    inProgress: [],
    completed: [],
  };
  detailsTitle = "";
  detailsDescription = "";
  detailsStatus:
    | TaskStatus.Pending
    | TaskStatus.InProgress
    | TaskStatus.Completed
    | TaskStatus.Tentative
    | TaskStatus.Confirmed
    | TaskStatus.Cancelled
    | TaskStatus.Scheduled
    | undefined = undefined;
  snapshotStore!: SnapshotStore<T, Meta, K>;

  subscribe = (callback: (snapshot: Snapshot<T, Meta, K>) => void) => {};
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;

  constructor( 
    storeProps: SnapshotStoreProps<T, Meta, K>,
    snapConfig: SnapshotConfig<T, Meta, K>
  ) {
    makeAutoObservable(this);
    this.initSnapshotStore(storeProps, snapConfig);
  }

  

  determineCategory(snapshot: Snapshot<T, Meta, K> | null | undefined): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

  private async initSnapshotStore(storeProps: SnapshotStoreProps<T, Meta, K>, snapConfig: SnapshotConfig<T, Meta, K>) {
    const initialState = null;
    const snapshotStoreProps: SnapshotStoreProps<T, Meta, K> = {
      id: storeProps.storeId.toString(), // Assuming ID needs to be a string
      storeId: storeProps.storeId,
      name: storeProps.name, // Assuming this relates to the store's name
      state: storeProps.snapshots || initialState, // Handle snapshots appropriately
      category: storeProps.category || 'default-category', // Default category
      timestamp: storeProps.timestamp || new Date(), // Default timestamp
      message: storeProps.message || '', // Default message
      eventRecords: [], // Default event records
      version: storeProps.version,
      schema: storeProps.schema,
      options: storeProps.options,
      config: storeProps.config,
      operation: storeProps.operation,
    }
    
    // Initialize the snapshot store using snapshotStoreProps
    this.snapshotStore = new SnapshotStore<T, Meta, K>({
      storeId: snapshotStoreProps.storeId,
      name: snapshotStoreProps.name,
      version: snapshotStoreProps.version,
      schema: snapshotStoreProps.schema,
      options: snapshotStoreProps.options,
      category: snapConfig.category,
      config: snapshotStoreProps.config,
      operation: snapshotStoreProps.operation,
    });

    const snapshotConfig: SnapshotConfig<T, Meta, K> = {
        id: snapConfig?.id || 'default-id', // Default or generate an ID
        store: snapConfig?.store || undefined, // Initialize appropriately
        state: snapConfig?.state || initialState, // Initialize state as needed
        category: snapConfig?.category || 'default-category', // Default or computed category
        timestamp: snapConfig?.timestamp || new Date(), // Default timestamp
        message: snapConfig?.message || '', // Default message
        eventRecords: {}, // Default event records
    
        // Other properties you want to default or initialize
        initialState: snapConfig?.initialState || undefined,
        isCore: snapConfig?.isCore || false,
        initialConfig: snapConfig?.initialConfig || undefined,
        removeSubscriber: snapConfig?.removeSubscriber || (() => {}),
        onInitialize: snapConfig?.onInitialize || (() => {}),
        onError: snapConfig?.onError || (() => {}),
        taskIdToAssign: snapConfig?.taskIdToAssign || undefined,
        schema: snapConfig?.schema || undefined,
        currentCategory: snapConfig?.currentCategory || undefined,
        mappedSnapshotData: snapConfig?.mappedSnapshotData || new Map(),
        storeId: snapConfig?.storeId || 0,
        snapshot: snapConfig?.snapshot || (() => undefined), // Provide a fallback
        setCategory: snapConfig?.setCategory || (() => {}),
        applyStoreConfig: snapConfig?.applyStoreConfig || (() => {}),
        generateId: snapConfig?.generateId || (() => 'default-generated-id'),
        snapshotData: snapConfig?.snapshotData || (() => ({} as SnapshotDataType<T, Meta, K>)),
        getSnapshotItems: snapConfig?.getSnapshotItems || (() => []),



         // New additional properties
         criteria: snapConfig?.criteria,
         storeConfig: snapConfig?.storeConfig,
         additionalData: snapConfig?.additionalData,
         
        defaultSubscribeToSnapshots: snapConfig?.defaultSubscribeToSnapshots,
        notify: snapConfig?.notify,
        notifySubscribers: snapConfig?.notifySubscribers,
        getAllSnapshots: snapConfig?.getAllSnapshots,
        getSubscribers: snapConfig?.getSubscribers,
        versionInfo: snapConfig?.versionInfo,
        transformSubscriber: snapConfig?.transformSubscriber,
        transformDelegate: snapConfig?.transformDelegate,
        initializedState: snapConfig?.initializedState,
        getAllKeys: snapConfig?.getAllKeys,
        getAllValues: snapConfig?.getAllValues,
        getAllItems: snapConfig?.getAllItems,
        getSnapshotEntries: snapConfig?.getSnapshotEntries,
        getAllSnapshotEntries: snapConfig?.getAllSnapshotEntries,
        addDataStatus: snapConfig?.addDataStatus,
        removeData: snapConfig?.removeData,
        updateData: snapConfig?.updateData,
        updateDataTitle: snapConfig?.updateDataTitle,
        updateDataDescription: snapConfig?.updateDataDescription,
        updateDataStatus: snapConfig?.updateDataStatus,
        addDataSuccess: snapConfig?.addDataSuccess,
        getDataVersions: snapConfig?.getDataVersions,
        updateDataVersions: snapConfig?.updateDataVersions,
        getBackendVersion: snapConfig?.getBackendVersion,
        getFrontendVersion: snapConfig?.getFrontendVersion,
        fetchData: snapConfig?.fetchData,
        defaultSubscribeToSnapshot: snapConfig?.defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: snapConfig?.handleSubscribeToSnapshot,
        removeItem: snapConfig?.removeItem,
        getSnapshot: snapConfig?.getSnapshot,
        getSnapshotSuccess: snapConfig?.getSnapshotSuccess,
        setItem: snapConfig?.setItem,
        getItem: snapConfig?.getItem,
        getDataStore: snapConfig?.getDataStore,
        getDataStoreMap: snapConfig?.getDataStoreMap,
        addSnapshotSuccess: snapConfig?.addSnapshotSuccess,
        deepCompare: snapConfig?.deepCompare,
        shallowCompare: snapConfig?.shallowCompare,
        getDataStoreMethods: snapConfig?.getDataStoreMethods,
        getDelegate: snapConfig?.getDelegate,
        determineCategory: snapConfig?.determineCategory,
        determinePrefix: snapConfig?.determinePrefix,
        removeSnapshot: snapConfig?.removeSnapshot,
        addSnapshotItem: snapConfig?.addSnapshotItem,
        addNestedStore: snapConfig?.addNestedStore,
        clearSnapshots: snapConfig?.clearSnapshots,
        addSnapshot: snapConfig?.addSnapshot,
        emit: snapConfig?.emit,
        createSnapshot: snapConfig?.createSnapshot,
        createInitSnapshot: snapConfig?.createInitSnapshot,
        addStoreConfig: snapConfig?.addStoreConfig,
        handleSnapshotConfig: snapConfig?.handleSnapshotConfig,
        getSnapshotConfig: snapConfig?.getSnapshotConfig,
        getSnapshotListByCriteria: snapConfig?.getSnapshotListByCriteria,
        setSnapshotSuccess: snapConfig?.setSnapshotSuccess,
        setSnapshotFailure: snapConfig?.setSnapshotFailure,
        updateSnapshots: snapConfig?.updateSnapshots,
        updateSnapshotsSuccess: snapConfig?.updateSnapshotsSuccess,
        updateSnapshotsFailure: snapConfig?.updateSnapshotsFailure,
        initSnapshot: snapConfig?.initSnapshot,
        takeSnapshot: snapConfig?.takeSnapshot,
        takeSnapshotSuccess: snapConfig?.takeSnapshotSuccess,
        takeSnapshotsSuccess: snapConfig?.takeSnapshotsSuccess,
        flatMap: snapConfig?.flatMap,
        getState: snapConfig?.getState,
        setState: snapConfig?.setState,
        validateSnapshot: snapConfig?.validateSnapshot,
        handleActions: snapConfig?.handleActions,
        setSnapshot: snapConfig?.setSnapshot,
        transformSnapshotConfig: snapConfig?.transformSnapshotConfig,
        setSnapshots: snapConfig?.setSnapshots,
        clearSnapshot: snapConfig?.clearSnapshot,
        mergeSnapshots: snapConfig?.mergeSnapshots,
        reduceSnapshots: snapConfig?.reduceSnapshots,
        sortSnapshots: snapConfig?.sortSnapshots,
        filterSnapshots: snapConfig?.filterSnapshots,
        findSnapshot: snapConfig?.findSnapshot,
        mapSnapshots: snapConfig?.mapSnapshots,
        takeLatestSnapshot: snapConfig?.takeLatestSnapshot,
        updateSnapshot: snapConfig?.updateSnapshot,
        addSnapshotSubscriber: snapConfig?.addSnapshotSubscriber,
        removeSnapshotSubscriber: snapConfig?.removeSnapshotSubscriber,
        getSnapshotConfigItems: snapConfig?.getSnapshotConfigItems,
        subscribeToSnapshots: snapConfig?.subscribeToSnapshots,
        executeSnapshotAction: snapConfig?.executeSnapshotAction,
        subscribeToSnapshot: snapConfig?.subscribeToSnapshot,
        unsubscribeFromSnapshot: snapConfig?.unsubscribeFromSnapshot,
        subscribeToSnapshotsSuccess: snapConfig?.subscribeToSnapshotsSuccess,
        unsubscribeFromSnapshots: snapConfig?.unsubscribeFromSnapshots,
        getSnapshotItemsSuccess: snapConfig?.getSnapshotItemsSuccess,
        getSnapshotItemSuccess: snapConfig?.getSnapshotItemSuccess,
        getSnapshotKeys: snapConfig?.getSnapshotKeys,
        getSnapshotIdSuccess: snapConfig?.getSnapshotIdSuccess,
        getSnapshotValuesSuccess: snapConfig?.getSnapshotValuesSuccess,
        getSnapshotWithCriteria: snapConfig?.getSnapshotWithCriteria,
        reduceSnapshotItems: snapConfig?.reduceSnapshotItems,
        subscribeToSnapshotList: snapConfig?.subscribeToSnapshotList,
        config: snapConfig?.config,
        data: snapConfig?.data as T,
        label: snapConfig?.label,
        events: snapConfig?.events,
        restoreSnapshot: snapConfig?.restoreSnapshot,
        handleSnapshot: snapConfig?.handleSnapshot,
        subscribe: snapConfig?.subscribe,
        meta: snapConfig?.meta,
        items: snapConfig?.items,
        subscribers: snapConfig?.subscribers,
        snapshotStore: snapConfig?.snapshotStore,
        setSnapshotCategory: snapConfig?.setSnapshotCategory,
        getSnapshotCategory: snapConfig?.getSnapshotCategory,
        getSnapshotData: snapConfig?.getSnapshotData,
        deleteSnapshot: snapConfig?.deleteSnapshot,
        getSnapshots: snapConfig?.getSnapshots,
        compareSnapshots: snapConfig?.compareSnapshots,
        compareSnapshotItems: snapConfig?.compareSnapshotItems,
        batchTakeSnapshot: snapConfig?.batchTakeSnapshot,
        batchFetchSnapshots: snapConfig?.batchFetchSnapshots,
        batchTakeSnapshotsRequest: snapConfig?.batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: snapConfig?.batchUpdateSnapshotsRequest,
        filterSnapshotsByStatus: snapConfig?.filterSnapshotsByStatus,
        filterSnapshotsByCategory: snapConfig?.filterSnapshotsByCategory,
        filterSnapshotsByTag: snapConfig?.filterSnapshotsByTag,
        batchFetchSnapshotsSuccess: snapConfig?.batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: snapConfig?.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: snapConfig?.batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: snapConfig?.batchUpdateSnapshotsFailure,
        handleSnapshotSuccess: snapConfig?.handleSnapshotSuccess,
        getSnapshotId: snapConfig?.getSnapshotId,
        compareSnapshotState: snapConfig?.compareSnapshotState,
      



        payload: snapConfig?.payload,
        dataItems: snapConfig?.dataItems,
       
        newData: snapConfig?.newData,
        getInitialState: snapConfig?.getInitialState,
        getConfigOption: snapConfig?.getConfigOption,
        getTimestamp: snapConfig?.getTimestamp,
       
        getStores: snapConfig?.getStores,
        getData: snapConfig?.getData,
        setData: snapConfig?.setData,
        addData: snapConfig?.addData,
       
        stores: snapConfig?.stores,
        getStore: snapConfig?.getStore,
        addStore: snapConfig?.addStore,
        mapSnapshot: snapConfig?.mapSnapshot,
        mapSnapshotWithDetails: snapConfig?.mapSnapshotWithDetails,
        removeStore: snapConfig?.removeStore,
        unsubscribe: snapConfig?.unsubscribe,
        fetchSnapshot: snapConfig?.fetchSnapshot,
        
        fetchSnapshotSuccess: snapConfig?.fetchSnapshotSuccess,
        updateSnapshotFailure: snapConfig?.updateSnapshotFailure,
        fetchSnapshotFailure: snapConfig?.fetchSnapshotFailure,
        addSnapshotFailure: snapConfig?.addSnapshotFailure,
       
        configureSnapshotStore: snapConfig?.configureSnapshotStore,
        updateSnapshotSuccess: snapConfig?.updateSnapshotSuccess,
        createSnapshotFailure: snapConfig?.createSnapshotFailure,
        createSnapshotSuccess: snapConfig?.createSnapshotSuccess,
       
        createSnapshots: snapConfig?.createSnapshots,
        snapConfig: snapConfig?.snapConfig,
        onSnapshot: snapConfig?.onSnapshot,
        onSnapshots: snapConfig?.onSnapshots,
        childIds: snapConfig?.childIds,
        getParentId: snapConfig?.getParentId,
        getChildIds: snapConfig?.getChildIds,
        addChild: snapConfig?.addChild,
       
        removeChild: snapConfig?.removeChild,
        getChildren: snapConfig?.getChildren,
        hasChildren: snapConfig?.hasChildren,
        isDescendantOf: snapConfig?.isDescendantOf,
        getSnapshotById: snapConfig?.getSnapshotById,
     
      };


      // Ensure delegate is correctly typed as Snapshot<T, Meta, K>
      const delegateSnapshot: Snapshot<T, Meta, K> = {
        // Provide appropriate default values for the snapshot
        id: snapshotConfig.id, // Default or generate an ID
        store: snapshotConfig.store, // Initialize appropriately
        state: snapshotConfig.state, // Initialize state as needed
        category: snapshotConfig.category, // Default or computed category
        timestamp: snapshotConfig.timestamp, // Default timestamp
        message: snapshotConfig.message, // Default message
        eventRecords: {}, // Default event records

        criteria: snapshotConfig.criteria,
        initialState: snapshotConfig.initialState,
        isCore: snapshotConfig.isCore,
        initialConfig: snapshotConfig.initialConfig,
        removeSubscriber: snapshotConfig.removeSubscriber,
       
        onInitialize: snapshotConfig.onInitialize,
        onError: snapshotConfig.onError,
        taskIdToAssign: snapshotConfig.taskIdToAssign,
        schema: snapshotConfig.schema,
       
        currentCategory: snapshotConfig.currentCategory,
        mappedSnapshotData: snapshotConfig.mappedSnapshotData,
        storeId: snapshotConfig.storeId,
        snapshot: snapshotConfig.snapshot,
       
        setCategory: snapshotConfig.setCategory,
        applyStoreConfig: snapshotConfig.applyStoreConfig,
        generateId: snapshotConfig.generateId,
        snapshotData: snapshotConfig.snapshotData,
       
        getSnapshotItems: snapshotConfig.getSnapshotItems,
        defaultSubscribeToSnapshots: snapshotConfig.defaultSubscribeToSnapshots,
        notify: snapshotConfig.notify,
        notifySubscribers: snapshotConfig.notifySubscribers,
       
        getAllSnapshots: snapshotConfig.getAllSnapshots,
        getSubscribers: snapshotConfig.getSubscribers,
        versionInfo: snapshotConfig.versionInfo,
        transformSubscriber: snapshotConfig.transformSubscriber,
        
        transformDelegate: snapshotConfig.transformDelegate,
        initializedState: snapshotConfig.initializedState,
        getAllKeys: snapshotConfig.getAllKeys,
        getAllValues: snapshotConfig.getAllValues,
       
        getAllItems: snapshotConfig.getAllItems,
        getSnapshotEntries: snapshotConfig.getSnapshotEntries,
        getAllSnapshotEntries: snapshotConfig.getAllSnapshotEntries,
        addDataStatus: snapshotConfig.addDataStatus,
       
        removeData: snapshotConfig.removeData,
        updateData: snapshotConfig.updateData,
        updateDataTitle: snapshotConfig.updateDataTitle,
        updateDataDescription: snapshotConfig.updateDataDescription,
        
        updateDataStatus: snapshotConfig.updateDataStatus,
        addDataSuccess: snapshotConfig.addDataSuccess,
        getDataVersions: snapshotConfig.getDataVersions,
        updateDataVersions: snapshotConfig.updateDataVersions,
       
        getBackendVersion: snapshotConfig.getBackendVersion,
        getFrontendVersion: snapshotConfig.getFrontendVersion,
        fetchData: snapshotConfig.fetchData,
        defaultSubscribeToSnapshot: snapshotConfig.defaultSubscribeToSnapshot,
       
        handleSubscribeToSnapshot: snapshotConfig.handleSubscribeToSnapshot,
        removeItem: snapshotConfig.removeItem,
        getSnapshot: snapshotConfig.getSnapshot,
        getSnapshotSuccess: snapshotConfig.getSnapshotSuccess,
       
        setItem: snapshotConfig.setItem,
        getItem: snapshotConfig.getItem,
        getDataStore: snapshotConfig.getDataStore,
        getDataStoreMap: snapshotConfig.getDataStoreMap,
       
        addSnapshotSuccess: snapshotConfig.addSnapshotSuccess,
        deepCompare: snapshotConfig.deepCompare,
        shallowCompare: snapshotConfig.shallowCompare,
        getDataStoreMethods: snapshotConfig.getDataStoreMethods,
        
        getDelegate: snapshotConfig.getDelegate,
        determineCategory: snapshotConfig.determineCategory,
        determinePrefix: snapshotConfig.determinePrefix,
        removeSnapshot: snapshotConfig.removeSnapshot,
        
        addSnapshotItem: snapshotConfig.addSnapshotItem,
        addNestedStore: snapshotConfig.addNestedStore,
        clearSnapshots: snapshotConfig.clearSnapshots,
        addSnapshot: snapshotConfig.addSnapshot,
       
        emit: snapshotConfig.emit,
        createSnapshot: snapshotConfig.createSnapshot,
        createInitSnapshot: snapshotConfig.createInitSnapshot,
        addStoreConfig: snapshotConfig.addStoreConfig,
       
        handleSnapshotConfig: snapshotConfig.handleSnapshotConfig,
        getSnapshotConfig: snapshotConfig.getSnapshotConfig,
        getSnapshotListByCriteria: snapshotConfig.getSnapshotListByCriteria,
        setSnapshotSuccess: snapshotConfig.setSnapshotSuccess,
       
        setSnapshotFailure: snapshotConfig.setSnapshotFailure,
        updateSnapshots: snapshotConfig.updateSnapshots,
        updateSnapshotsSuccess: snapshotConfig.updateSnapshotsSuccess,
        updateSnapshotsFailure: snapshotConfig.updateSnapshotsFailure,
       
        initSnapshot: snapshotConfig.initSnapshot,
        takeSnapshot: snapshotConfig.takeSnapshot,
        takeSnapshotSuccess: snapshotConfig.takeSnapshotSuccess,
        takeSnapshotsSuccess: snapshotConfig.takeSnapshotsSuccess,
       
        flatMap: snapshotConfig.flatMap,
        getState: snapshotConfig.getState,
        setState: snapshotConfig.setState,
        validateSnapshot: snapshotConfig.validateSnapshot,
        
        handleActions: snapshotConfig.handleActions,
        setSnapshot: snapshotConfig.setSnapshot,
        transformSnapshotConfig: snapshotConfig.transformSnapshotConfig,
        setSnapshots: snapshotConfig.setSnapshots,
        
        clearSnapshot: snapshotConfig.clearSnapshot,
        mergeSnapshots: snapshotConfig.mergeSnapshots,
        reduceSnapshots: snapshotConfig.reduceSnapshots,
        sortSnapshots: snapshotConfig.sortSnapshots,
       
        filterSnapshots: snapshotConfig.filterSnapshots,
        findSnapshot: snapshotConfig.findSnapshot,
        mapSnapshots: snapshotConfig.mapSnapshots,
        takeLatestSnapshot: snapshotConfig.takeLatestSnapshot,
        
        updateSnapshot: snapshotConfig.updateSnapshot,
        addSnapshotSubscriber: snapshotConfig.addSnapshotSubscriber,
        removeSnapshotSubscriber: snapshotConfig.removeSnapshotSubscriber,
        getSnapshotConfigItems: snapshotConfig.getSnapshotConfigItems,
       
        subscribeToSnapshots: snapshotConfig.subscribeToSnapshots,
        executeSnapshotAction: snapshotConfig.executeSnapshotAction,
        subscribeToSnapshot: snapshotConfig.subscribeToSnapshot,
        unsubscribeFromSnapshot: snapshotConfig.unsubscribeFromSnapshot,
       
        subscribeToSnapshotsSuccess: snapshotConfig.subscribeToSnapshotsSuccess,
        unsubscribeFromSnapshots: snapshotConfig.unsubscribeFromSnapshots,
        getSnapshotItemsSuccess: snapshotConfig.getSnapshotItemsSuccess,
        getSnapshotItemSuccess: snapshotConfig.getSnapshotItemSuccess,
       
        getSnapshotKeys: snapshotConfig.getSnapshotKeys,
        getSnapshotIdSuccess: snapshotConfig.getSnapshotIdSuccess,
        getSnapshotValuesSuccess: snapshotConfig.getSnapshotValuesSuccess,
        getSnapshotWithCriteria: snapshotConfig.getSnapshotWithCriteria,
       
        reduceSnapshotItems: snapshotConfig.reduceSnapshotItems,
        subscribeToSnapshotList: snapshotConfig.subscribeToSnapshotList,
        config: snapshotConfig.config,
        data: snapshotConfig.data,
       
        label: snapshotConfig.label,
        events: snapshotConfig.events,
        restoreSnapshot: snapshotConfig.restoreSnapshot,
        handleSnapshot: snapshotConfig.handleSnapshot,
       
        subscribe: snapshotConfig.subscribe,
        meta: snapshotConfig.meta,
        items: snapshotConfig.items,
        subscribers: snapshotConfig.subscribers,
       
        snapshotStore: snapshotConfig.snapshotStore,
        setSnapshotCategory: snapshotConfig.setSnapshotCategory,
        getSnapshotCategory: snapshotConfig.getSnapshotCategory,
        getSnapshotData: snapshotConfig.getSnapshotData,
        
        deleteSnapshot: snapshotConfig.deleteSnapshot,
        getSnapshots: snapshotConfig.getSnapshots,
        compareSnapshots: snapshotConfig.compareSnapshots,
        compareSnapshotItems: snapshotConfig.compareSnapshotItems,
       
        batchTakeSnapshot: snapshotConfig.batchTakeSnapshot,
        batchFetchSnapshots: snapshotConfig.batchFetchSnapshots,
        batchTakeSnapshotsRequest: snapshotConfig.batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: snapshotConfig.batchUpdateSnapshotsRequest,
       
        filterSnapshotsByStatus: snapshotConfig.filterSnapshotsByStatus,
        filterSnapshotsByCategory: snapshotConfig.filterSnapshotsByCategory,
        filterSnapshotsByTag: snapshotConfig.filterSnapshotsByTag,
        batchFetchSnapshotsSuccess: snapshotConfig.batchFetchSnapshotsSuccess,
       
        batchFetchSnapshotsFailure: snapshotConfig.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: snapshotConfig.batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: snapshotConfig.batchUpdateSnapshotsFailure,
        handleSnapshotSuccess: snapshotConfig.handleSnapshotSuccess,
       
        getSnapshotId: snapshotConfig.getSnapshotId,
        compareSnapshotState: snapshotConfig.compareSnapshotState,
        payload: snapshotConfig.payload,
        dataItems: snapshotConfig.dataItems,
       
        newData: snapshotConfig.newData,
        getInitialState: snapshotConfig.getInitialState,
        getConfigOption: snapshotConfig.getConfigOption,
        getTimestamp: snapshotConfig.getTimestamp,
       
        getStores: snapshotConfig.getStores,
        getData: snapshotConfig.getData,
        setData: snapshotConfig.setData,
        addData: snapshotConfig.addData,
       
        stores: snapshotConfig.stores,
        getStore: snapshotConfig.getStore,
        addStore: snapshotConfig.addStore,
        mapSnapshot: snapshotConfig.mapSnapshot,
        mapSnapshotWithDetails: snapshotConfig.mapSnapshotWithDetails,
        removeStore: snapshotConfig.removeStore,
        unsubscribe: snapshotConfig.unsubscribe,
        fetchSnapshot: snapshotConfig.fetchSnapshot,
        
        fetchSnapshotSuccess: snapshotConfig.fetchSnapshotSuccess,
        updateSnapshotFailure: snapshotConfig.updateSnapshotFailure,
        fetchSnapshotFailure: snapshotConfig.fetchSnapshotFailure,
        addSnapshotFailure: snapshotConfig.addSnapshotFailure,
       
        configureSnapshotStore: snapshotConfig.configureSnapshotStore,
        updateSnapshotSuccess: snapshotConfig.updateSnapshotSuccess,
        createSnapshotFailure: snapshotConfig.createSnapshotFailure,
        createSnapshotSuccess: snapshotConfig.createSnapshotSuccess,
       
        createSnapshots: snapshotConfig.createSnapshots,
        snapConfig: snapshotConfig.snapConfig,
        onSnapshot: snapshotConfig.onSnapshot,
        onSnapshots: snapshotConfig.onSnapshots,
        childIds: snapshotConfig.childIds,
        getParentId: snapshotConfig.getParentId,
        getChildIds: snapshotConfig.getChildIds,
        addChild: snapshotConfig.addChild,
       
        removeChild: snapshotConfig.removeChild,
        getChildren: snapshotConfig.getChildren,
        hasChildren: snapshotConfig.hasChildren,
        isDescendantOf: snapshotConfig.isDescendantOf,
        getSnapshotById: snapshotConfig.getSnapshotById,
        // Add all other necessary properties with default values
      };

      const category = this.determineCategory(delegateSnapshot);

      await notify(
        "internal snapshot notifications",
        "Setting up snapshot details",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
        new Date(),
        NotificationTypeEnum.InvalidCredentials
      );

      const options = createSnapshotStoreOptions<T, Meta, K>({
        initialState,
        snapshotId: "snapshot_123", // Example snapshot ID, replace with actual ID
        category: category as unknown as CategoryProperties,
        categoryProperties: {
          name: "Snapshot Store Management",  // Name specific to managing snapshots
          description: "Category for managing snapshot stores and their operations.",  // Clear description of the category's purpose
          icon: "snapshot-store-icon.svg",  // Icon related to snapshots
          color: "#2E8B57",  // A relevant color for the snapshot store category (e.g., green for success or management)
          iconColor: "#FFFFFF",  // White icon color for contrast
          isActive: true,  // The category is currently active and in use
          isPublic: false,  // This category is private, not accessible to general users
          isSystem: true,  // System category, important for managing internal operations
          isDefault: false,  // Not the default category for snapshots, could be customized
          isHidden: false,  // Visible in the UI
          isHiddenInList: false,  // Shown in list views
          UserInterface: ["SnapshotListComponent", "SnapshotDetailsComponent"],  // Components related to displaying snapshots in the UI
          DataVisualization: ["SnapshotHistoryChart", "StoreUsageGraph"],  // Data visualization specific to snapshots
          Forms: {
            snapshotConfigForm: "Form for configuring snapshot settings",  // Form related to snapshot configuration
            snapshotStoreSettings: "Settings for managing snapshot stores"  // Form related to store settings
          },
          Analysis: ["SnapshotAnalysisComponent", "StoreDataInsights"],  // Tools for analyzing snapshot data
          Communication: ["SnapshotNotificationSystem"],  // Related communication components for notifying users about snapshot events
          TaskManagement: ["SnapshotTaskScheduler", "SnapshotReminder"],  // Task management components for snapshot-related tasks
          Crypto: [],  // No crypto components relevant in this context, left empty
          brandName: "Snapshot Manager",  // Brand name specific to snapshot management
          brandLogo: "snapshot-brand-logo.svg",  // Path to the logo associated with the snapshot manager brand
          brandColor: "#4B0082",  // Brand color for the snapshot manager (e.g., Indigo)
          brandMessage: "Manage your snapshots efficiently with our state-of-the-art snapshot store."  // Custom message relevant to the snapshot manager's purpose
        },
        dataStoreMethods: {
          // Provide appropriate dataStoreMethods
        },

      });

      const {
        storeId,
        name,
        version,
        schema,
        config,
        operation,
      } = storeProps;
    
      // Check for missing required fields
      if (!name || !version || !operation) {
        throw new Error("Name, operation and version are required for SnapshotStore");
      }

      this.snapshotStore = new SnapshotStore<T, Meta, K>({storeId, name, version, schema, options, category, config, operation});
    }

  updateDetailsTitle(id: string, newTitle: string): void {
    const details = this.details;

    // Assuming details[id] is an array of DetailsItem
    details.pending.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    details.inProgress.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    details.completed.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    this.setDetails(details);
  }

  toggleDetails(detailsId: string): void {
    const details = this.details;
    const status = this.detailsStatus;

    // Ensure detailsStatus is defined before using it as an index
    if (status === undefined) {
      console.error("Details status is undefined.");
      return;
    }

    const index = details[status].findIndex((item) => item.id === detailsId);

    if (index !== -1) {
      details[status].splice(index, 1);
    } else {
      details[status].push({
        _id: detailsId,
        id: detailsId,
        description: this.detailsDescription,
        title: this.detailsTitle,
        status: this.detailsStatus as
          | TaskStatus.Pending
          | TaskStatus.InProgress
          | TaskStatus.Completed,
        phase: {
          id: "",
          index: 0,
          name: "Phase Name",
          color: "#000000",
          status: "",
          createdAt: undefined,
          updatedAt: undefined,
          startDate: undefined,
          endDate: undefined,
          subPhases: [] as Phase[],
          component: {} as FC<any>,
          hooks: {
            onPhaseStart: [],
            onPhaseEnd: [],
            onPhaseUpdate: [],
            resetIdleTimeout: async () => {},
            isActive: false,
            progress: {
              id: "",
              name: "",
              label: "",
              color: "",
              max: 0,
              min: 0,
              value: 0,
              current: 0,
              percentage: 0,
              description: "",
              done: false,
            },
            condition: async () => false,
          },
          duration: 0,
        },
        data: {} as DetailsItemExtended["data"],
        isActive: false,
        type: "details",
        analysisResults: {} as DetailsItemExtended["analysisResults"],
        updatedAt: undefined,
      });
    }

    this.setDetails(details);
  }

  updateDetailsDescription(id: string, description: string): void {
    const details = this.details;

    // Assuming details[id] is an array of DetailsItem
    details.pending.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    details.inProgress.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    details.completed.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    this.setDetails(details);
  }

  updateDetailsStatus(status: AllStatus): void {
    // Map StatusType values to TaskStatus values
    switch (status) {
      case StatusType.Pending:
        this.detailsStatus = TaskStatus.Pending;
        break;
      case StatusType.InProgress:
        this.detailsStatus = TaskStatus.InProgress;
        break;
      case StatusType.Completed:
        this.detailsStatus = TaskStatus.Completed;
        break;
      case StatusType.Tentative:
        // Handle Tentative status if needed
        this.detailsStatus = TaskStatus.Tentative;
        break;
      case StatusType.Confirmed:
        this.detailsStatus = TaskStatus.Confirmed;
        // Handle Confirmed status if needed
        break;
      case StatusType.Cancelled:
        this.detailsStatus = TaskStatus.Cancelled;
        break;
      case StatusType.Scheduled:
        this.detailsStatus = TaskStatus.Scheduled;
        break;
      default:
        this.detailsStatus = undefined;
        break;
    }
  }

  addDetailsItem(detailsItem: DetailsItemExtended): void {
    let status: AllStatus = detailsItem.status || TaskStatus.Pending;

    this.details = {
      ...this.details,
      [status]: [...(this.details[status] || []), detailsItem],
    };

    // Optionally, you can trigger notifications or perform other actions on success
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  }

  addDetails(): void {
    // Ensure the title is not empty before adding an item
    if (this.detailsTitle.trim().length === 0) {
      console.error("Item title cannot be empty.");
      return;
    }

    const newDetailsItem: DetailsItemExtended = {
      id: Date.now().toString(),
      title: this.detailsTitle,
      status: TaskStatus.Pending,
      description: this.detailsDescription,
      // data: {} as Data,
      phase: {} as DetailsItemExtended["phase"],
      isActive: false,
      type: "details",
      _id: "",
      analysisResults: [],
      updatedAt: undefined,
    };

    this.addDetailsItem(newDetailsItem);

    // Reset input fields after adding an item
    this.detailsTitle = "";
    this.detailsDescription = "";
    this.detailsStatus = TaskStatus.Pending;
  }

  setDetails(details: Record<string, DetailsItemExtended[]>): void {
    this.details = details;
  }

  removeDetails(detailsId: string): void {
    const updatedDetails = { ...this.details };
    delete updatedDetails[detailsId];
    this.details = updatedDetails;
  }

  removeDetailsItems(detailsIds: string[]): void {
    const updatedDetails = { ...this.details };
    detailsIds.forEach((detailsId) => {
      delete updatedDetails[detailsId];
    });
    this.details = updatedDetails;
  }

  // Function to set a dynamic notification message
  setDynamicNotificationMessage = (message: string) => {
    this.setDynamicNotificationMessage(message);
  };

  addDetail(detail: Data): void {
    // Assuming 'detail' is a valid Data object to be added
    let status: AllStatus = detail.status || TaskStatus.Pending;

    // Ensure detail.id is not null or undefined before assigning
    const id: string = String(detail.id) ?? "";

    // Ensure detail.description is always a string or undefined
    const description: string = detail.description || ""; // Provide a default empty string if description is null or undefined
    const phase: Phase = detail.phase || ({} as Phase); // Provide a default empty object if phase is null or undefined

    // Create a copy of the current state of details
    const updatedDetails = { ...this.details };

    // Get the array associated with the current status or create a new empty array
    const statusArray = updatedDetails[status] || [];

    if (detail.title !== undefined) {
      // Add the new detail to the status array
      statusArray.push({
        _id: detail.title,
        id: id,
        title: detail.title,
        status: detail.status,
        description: description,
        phase: phase,
        type: "detail",
        isActive: false,
        analysisResults: [],
        updatedAt: undefined,
      });
    }
    // Update the details object with the new status array
    updatedDetails[status] = statusArray;

    // Set the updated details object to the class property
    this.details = updatedDetails;
  }
}

const useDetailsListStore = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(storeProps: SnapshotStoreProps<T, Meta, K>, snapConfig: SnapshotConfig<T, Meta, K>): DetailsListStore<T,K> => {
  return new DetailsListStoreClass(storeProps, snapConfig);
};

export { useDetailsListStore };
export type { DetailsItem, DetailsItemExtended };

