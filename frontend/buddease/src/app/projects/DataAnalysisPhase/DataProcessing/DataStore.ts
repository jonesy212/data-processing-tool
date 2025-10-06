// DataStore.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { fetchSnapshotById } from '@/app/api/SnapshotApi';
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { SearchCriteria } from '@/app/components/routing/SearchCriteria';
import { NotificationType } from "@/app/context/NotificationContext";
import storeProps from '@/app/hooks/YourComponent';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { getCategoryProperties } from '@/app/libraries/categories/CategoryManager';
import { BaseData, Data } from '@/app/models/data/Data';
import { allCategories } from '@/app/models/data/DataStructureCategories';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { ConfigureSnapshotStorePayload, SnapshotConfig, snapshotContainer, SnapshotData, SnapshotItem, SnapshotStoreMethod, SnapshotStoreProps } from '@/app/snapshots';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "@/app/snapshots/LocalStorageSnapshotStore";
import { retrievedSnapshot } from "@/app/snapshots/RetrieveSnapshotData";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotContainer, SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import { SnapshotEvents } from '@/app/snapshots/SnapshotEvents';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { InitializedData, InitializedDataStore } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotSubscriberManagement } from "@/app/snapshots/SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { BaseSnapshotProps } from "@/app/snapshots/createBaseSnapshot";
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { default as isSnapshotArrayState, default as isSnapshotsArray } from '@/app/snapshots/createSnapshotOptions';
import { getSnapshotItems } from '@/app/snapshots/snapshotOperations';
import { Callback } from '@/app/snapshots/subscribeToSnapshotsImplementation';
import transformDataToSnapshot from '@/app/snapshots/transformDataToSnapshot';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { store } from '@/app/state/stores/useAppDispatch';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { Subscription } from '@/app/subscriptions/Subscription';
import { convertMapToSnapshot, convertSnapshotStoreToSnapshot, isSnapshotStore } from '@/app/typings/YourSpecificSnapshotType';
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import { isSnapshot, isSnapshotOfType } from "@/app/utils/snapshotUtils";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { CreateSnapshotStoresPayload, Payload, UpdateSnapshotPayload } from '@/server/database/Payload';


import { DataStoreMethods } from '@/ DataStoreMethods';
import { DataActions } from '@/app/actions/DataActions';
import * as apiData from "@/app/api/ApiData";
import { DataContext } from '@/app/context/DataContext';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { MixedCriteria } from '@/app/pages/searchs/CriteriaOptions';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import { defaultSubscribeToSnapshot } from '@/app/snapshots/defaultSnapshotSubscribeFunctions';
import { defaultSubscribeToSnapshots } from '@/app/snapshots/defaultSubscribeToSnapshots';
import { returnsSnapshotStore } from '@/app/snapshots/responsetUtils';
import { getCurrentAppInfo } from '@/app/versions/VersionGenerator';
import { createVersionInfo } from '@/app/versions/createVersionInfo';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { AxiosResponse } from "axios";
import { IHydrateResult } from 'mobx-persist';
import { useContext } from 'react';
import { useDispatch } from "react-redux";

const dispatch = useDispatch()


interface CommonDataStoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  getSnapshotByKey(key: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  mapSnapshotStore(
    storeId: number,
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
     snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
  ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | undefined>;
  getSubscribers(
    snapshotId: string,
    category: Category | undefined,    
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ): Promise<Subscriber<T, K>[]>;
  getDataWithSearchCriteria(criteria: FilterCriteria): T[];
  getDataWithSearchCriteria(criteria: SearchCriteria): T[];
  getDataWithSearchCriteria(criteria: MixedCriteria): T[];  
  addData: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> >) => void;
}
function createDataStore<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() {
  const config = {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    // You need to provide all required properties of SnapshotContainer here
    snapshotId: undefined,
    categoryProperties: undefined,
    data: null,
    // ... other required properties
  };
  return {
    container,
    config,
  };
}

export interface DataStore<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends SnapshotSubscriberManagement<T, K, Meta, ExcludedFields> ,
  BaseSnapshotProps<T, K, Meta, ExcludedFields>,
  SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  CommonDataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  id: string | number | undefined
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  dataStore?: InitializedDataStore<T> | undefined
  storage?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  subscribers: SubscriberCollection<T, K>;
  snapshots: Snapshots<T, K>;

  getData: (
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, CustomSnapshotData<T, K, Meta, ExcludedFields>  & K, StructuredMetadata<T, CustomSnapshotData<T, K, Meta, ExcludedFields>  & K>>
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;

  // Add convertKeyToT method
  convertKeyToT: (key: string) => T; // Adjust as necessary
  
  getSubscribers: (
    snapshotId: string,
    category: Category | undefined,    
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ) => Promise<Subscriber<T, K>[]>;

  mapSnapshot: (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined>;
  
  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,    
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: K,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,      
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: K,
      index: number
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotsArray<T, K, Meta, ExcludedFields> >

  mapSnapshotStore: (
    storeId: number,
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<any, any>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<any, any>,
    data: any,
    // snapshotsArray: SnapshotsArray<any>,
    // snapshotsObject: SnapshotsObject<any>
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  


  // Function to add a new Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> to the data store
 addData: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
 removeData: (id: number) => void 
 updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  
 
 // mapSnapshotStores: (
  //   storeId: number,
    // snapshotId: string,
    // category: symbol | string | Category | undefined,
    // categoryProperties: CategoryProperties | undefined,
    // snapshot: Snapshot<any, any>,
    // timestamp: string | number | Date | undefined,
    // type: string,
    // event: Event,
    // id: number,
    // snapshotStore: SnapshotStore<any, any>,
  //   data: Data
  // ) => Promise<SnapshotStore<T>[]>;

  getSuubscribers: (
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ) => Promise<Subscriber<T, K>[]>;

   // Subscriber Handling
   getSubscribersWithFilters: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: symbol | string | Category,
    categoryProperties?: CategoryProperties,
    timestamp?: string | number | Date,
  ) => Promise<Subscriber<T, K>[]>;


  determineSnapshotStoreCategory: (
    storeId: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => string;

  getDataWithSearchCriteria: (id: number) => Promise<SnapshotWithCriteria<T, K> | undefined>;
  
  initializedState: InitializedState<T, K> | null;
  getStoreData: (id: number) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  getItem: (key: T, id: number) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;
  updateStoreData: (
    data: Data<T>,
    id: number,
    newData: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  getAllData: () => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  addDataStatus: (id: number, status: StatusType | undefined, updateSnapshot: (id: string, status: StatusType) => void) => void;
  updateDataStatus: (id: number, status: StatusType | undefined) => void;
  addDataSuccess: (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => void;
  getDataVersions: (id: number) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;
  updateDataVersions: (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;
  // getBackendVersion: () => Promise<string | undefined>;


  getBackendVersion: () => Promise<string> | IHydrateResult<number> | undefined;
  getFrontendVersion: () => Promise<string> | IHydrateResult<number> | undefined;

  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
  ) => Promise<string[] | undefined> | undefined;

  fetchData: (id: number,  storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  defaultSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  handleSubscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  setItem: (id: string, item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: (
    storeId: number,
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: SnapshotUnion<T, K, Meta, ExcludedFields>  | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | undefined;

  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  }) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;


  updateDelegate: (
    delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      }>
      | undefined
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  getSnapshotWithCriteria: (
    category: Category | undefined,    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
  ) => Promise<SnapshotWithCriteria<T, K> | undefined>;

  getSnapshotContainer: (
    category: string, // Adjusted to more specific type
    timestamp: string, // Adjusted to more specific type
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Data<T>,
    snapshotsArray: SnapshotsArray<T, K, Meta, ExcludedFields> ,
    snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>
  
  snapshotMethods?: SnapshotStoreMethod<T, K, Meta, ExcludedFields>[] | undefined;
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  getSnapshotVersions: (
    category: Category | undefined,    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;
  // storage: SnapshotStore<T> | undefined;
  getSnapshotWithCriteriaVersions: (
    category: Category | undefined,    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T
  ) => Promise<SnapshotWithCriteria<T, K>[] | undefined>
  dataStoreConfig: DataStore<T, K> | undefined
}



interface VersionedData <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: (id: number) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
}

const useVersionedData =  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: Map<string, T>,
  fetchData: () => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
): VersionedData<T, K> => {
  const { versionNumber } = getCurrentAppInfo();
  return {
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {}, // Provide appropriate values
    getData: fetchData, // Provide appropriate values
  };
};



interface CallbackItem<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotItem<T, K> {
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}

type InitializedState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | T
  | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  | null
  | undefined;
  
  
  
  const initializeState = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
    initialState: InitializedState<T, K, Meta, ExcludedFields> 
  ): InitializedState<T, K, Meta, ExcludedFields>  => {
    if (isSnapshot(initialState)) {
      return initialState; // Handles a single snapshot
    } else if (isSnapshotStore(initialState)) {
      return initialState; // Handles a snapshot store
    } else if (initialState instanceof Map) {
      return initialState; // Handles Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    } else if (isSnapshotArrayState(initialState)) {
      return initialState; // Handles array of snapshots using isSnapshotArrayState utility
    } else if (isSnapshotsArray(initialState)) {
      return initialState; // Handles arrays that meet specific criteria with isSnapshotsArray
    } else if (initialState === null || initialState === undefined) {
      return initialState; // Explicitly handle null or undefined
    } else {
      throw new Error("Invalid initial state type");
    }
  };
  

interface EventManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  eventRecords: {
    [key: string]: EventRecord<T, K, Meta, ExcludedFields> []; // Index signature to allow string keys
  };
}

// Factory function to create an instance of EventManager
function createEventManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): EventManager<T, K, Meta, ExcludedFields> {
  return {
    eventRecords: {} // Initialize with an empty object
  };
}


interface EventRecord<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  record: CalendarManagerStoreClass<T, K>;  // Adjust as necessary
  records?: CalendarManagerStoreClass<T, K>[];  // Adjust as necessary
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  action: string; // Add 'action' if it's a string, adjust type if necessary
  timestamp: string | number | Date | undefined; // Add 'timestamp', adjust type if necessary
  snapshotRecords?: Record<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>; // Add snapshotRecords to store snapshots 
}


class ConfigurableSnapshotStore<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotStore<T, K, Meta, ExcludedFields> 
{

  protected setConfig(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    // Logic to set config specifically for ConfigurableSnapshotStore
    super.setConfig(config)

    // Custom logic specific to ConfigurableSnapshotStore
    if (config.logging) {
      console.log('Logging enabled for ConfigurableSnapshotStore.');
    }

    if (config.autoSync) {
      console.log('Auto-sync enabled for ConfigurableSnapshotStore.');
    }

     // Nothing else to return, resolves as void
    return;
  }

  public configure(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.setConfig(config); // Now we can call the protected method
  }

    // Use existing API function to load snapshot
  public async loadFromApi(id: number): Promise<void> {
    try {
      const snapshotData = await fetchSnapshotById<T, K, Meta, ExcludedFields>(id);
      if (snapshotData) {
        // Assuming SnapshotStore has a `snapshots` map or array
        this.snapshots.set(snapshotData.id, snapshotData);
      }
    } catch (err) {
      console.error('Failed to load snapshot from API', err);
      throw err;
    }
  }
}

const useDataStore = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  initialState: InitializedState<T, K> = null
): DataStore<T, K> & VersionedData<T, K> => {
  const data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
  const context = useContext(DataContext);
  const API_BASE_URL = endpoints.snapshots
  const dispatch = useDispatch();
  // Function to convert a Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> into T
  const convertSnapshotToData = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): T => {
    // Assuming Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> has a property 'data' that holds T
    return snapshot.data as T;
  };
    
  const fetchData = async (
    id: number,
    storeConfigProps: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<ConfigurableSnapshotStore<T, K, Meta, ExcludedFields>> => {
    try {
      const dataStore = useDataStore<T, K>();
      if (!context) {
        throw new Error("Context is undefined");
      }
      const delegateConfigs = await dataStore.getDelegate({
        useSimulatedDataSource: context.useSimulatedDataSource,
        simulatedDataSource: context.simulatedDataSource,
      });
      console.log("Delegate Configs:", delegateConfigs);

      dispatch(DataActions().fetchDataRequest());

        // Fetch the data from the API
      const responseData = await axiosInstance.get<AxiosResponse<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>(
        endpoints.snapshots.single(id.toString()), // Update this line
        {
          headers: headersConfig, // Assuming you have prepared headers similar to before
        }
      );

      // Type assertion to inform TypeScript about the expected shape
      const jsonData = responseData.data
      const {
        snapshotId, 
        snapshot, 
        snapshotManager, 
        payload, 
        callback, 
        snapshotStoreData, 
        category, 
      } = storeConfigProps

        // Ensure you’re using the proper class
    const snapshotData = new ConfigurableSnapshotStore<T, K, Meta, ExcludedFields>();

    await snapshotData.loadFromApi(id);
    // Apply config after instantiation
    snapshotData.setConfig(storeConfigProps);
    return snapshotData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
 
 
  const addData = (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void => {
    dispatch(DataActions<T, K>().addData(newData));
  };


  const removeData = (id: number) => {
    dispatch(DataActions().removeData({ id }));
  };

  const typeCheck = (snapshot: Snapshot<any, any>): snapshot is Snapshot<any, any> => {
    // Implement actual type checking logic here
    return snapshot && snapshot.id !== undefined;
  };

  const updateData = (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void => {
    if (isSnapshotOfType<T, K>(newData, typeCheck)) {
      dispatch(DataActions<T, K>().updateData({ id, newData }));
    }
  };


  // Function to set an item in the data store
  const setItem = async (id: string, item: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Create a snapshot instance with the required properties
      const snapshot = createSnapshot(item) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
      // Check if the snapshot is a valid instance
      if (isSnapshot(snapshot)) {
        data.set(id, snapshot);
        resolve();
      } else {
        reject(new Error("Failed to create a valid Snapshot instance."));
      }
    });
  };

// Function to get an item from the data store
const getItem = (key: T, id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
  return new Promise((resolve) => {
    // Assuming `key` has an 'id' property to match against the provided `id`
    if ((key as any).id === id) {
      const snapshot = data.get((key as any).id.toString());
      if (snapshot) {
        resolve(snapshot);
      } else {
        resolve(undefined);
      }
    } else {
      resolve(undefined);
    }
  });
};

  const getAllItems = (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    return new Promise((resolve) => {
      const items = Array.from(data.values());
      resolve(items);
    });
  };

  const removeItem = (key: string | number): Promise<void> => {
    return new Promise((resolve) => {
      
      data.delete(String(key));
      resolve();
    });
  };

  const updateDataTitle = (id: number, title: string) => {
    dispatch(DataActions().updateDataTitle({ id, title }));
  };

  const updateDataDescription = (id: number, description: string) => {
    dispatch(
      DataActions().updateDataDescription({
        type: "updateDataDescription",
        payload: description,
      })
    );
  };

  const updateDataStatus = (
    id: number,
    status: StatusType | undefined
  ) => {
    dispatch(
      DataActions().updateDataStatus({
        type: "updateDataStatus",
        payload: status,
      })
    );
  };

  const getDataVersions = async (id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {
    try {
      const response = await apiData.getDataVersions(id);
      const dataVersions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = response.map((version): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
        const { id, versionNumber, appVersion, content, ...rest } = version;
        return rest as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      });
      return dataVersions;
    } catch (error) {
      console.error("Error fetching data versions:", error);
      return undefined;
    }
  };



  const addDataSuccess = async (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }): Promise<void> => {
    const { data: newData } = payload;

      // Destructure needed properties from `storeProps`
    const { 
      storeId,
      name, 
      version, 
      schema, 
      options,
      category, 
      config, 
      operation, 
      snapshots, 
      expirationDate, 
      payload: storePayload, 
      callback, 
      endpointCategory ,
      criteria,
      subscriberId,
      events,
      dataItems,
    } = storeProps; 

    for (const item of newData) {
      if ('id' in item && item.id) {
        try {

          const snapshot = await (snapshotApi.getSnapshot(item.id, item.storeId) as Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>);

          if (snapshot) {
            const { id, versionNumber, appVersion, content, ...rest } = snapshot as Record<string, any>;
            const newSnapshot = rest as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
            data.set(item.id.toString(), newSnapshot);

            // Safely cast the category from the command line argument
            const categoryArg = process.argv[3];
            const category = categoryArg as keyof typeof allCategories;

            const categoryProperties = getCategoryProperties(category);
            const snapshotStoreConfig = useDataStore().snapshotStoreConfig as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

            const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;

            // Define criteria with empty or null properties
            const criteria: CriteriaType = {
              startDate: undefined,
              filterBy: '',
              value: '',
              endDate: undefined,
              status: null,
              priority: null,
              assignedUser: null,
              notificationType: null,
              todoStatus: null,
              taskStatus: null,
              teamStatus: null,
              dataStatus: null,
              calendarStatus: null,
              notificationStatus: null,
              bookmarkStatus: null,
              priorityType: null,
              projectPhase: null,
              developmentPhase: null,
              subscriberType: null,
              subscriptionType: null,
              analysisType: null,
              documentType: null,
              fileType: null,
              tenantType: null,
              ideaCreationPhaseType: null,
              securityFeatureType: null,
              feedbackPhaseType: null,
              contentManagementType: null,
              taskPhaseType: null,
              animationType: null,
              languageType: null,
              codingLanguageType: null,
              formatType: null,
              privacySettingsType: null,
              messageType: null,
            };


            const typedSnapshotId = snapshotId as keyof SnapshotStore<Snapshot< BaseData<any>,  BaseData<any>>>;
            const snapshotData = returnsSnapshotStore[typedSnapshotId];
            const delegate = useDataStore()?.snapshotStoreConfig?.find(config => config.delegate)?.delegate ?? null;
            const snapshotId = await snapshot.store.snapshotId;
            if (numericId !== null && !isNaN(numericId)) {
              snapshotApi.getSnapshotConfig(
                String(numericId),
                snapshotId,
                criteria,
                category,
                categoryProperties,
                subscriberId,
                delegate,
                snapshotData,
                snapshot,
                data,
                events,
                dataItems,
                newData,
                payload,
                store,
                callback,
                storeProps,
                endpointCategory,
                snapshotContainer,
              ).then((snapshotConfig) => {
                const snapshotItem: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = transformDataToSnapshot(item, snapshotConfig, snapshotStoreConfig);

                if (snapshotItem.data instanceof Map && item.id !== undefined) {
                  snapshotItem.data.set(item.id.toString(), item);
                }
              }).catch((error) => {
                console.error("Error getting snapshot config for item:", item, error);
              });
            }
          }
        } catch (error) {
          console.error("Error processing item:", item, error);
        }
      }
    }
  }



  const addDataStatus = (
    id: number,
    status: StatusType | undefined,
    updateSnapshot: (id: string, status: StatusType) => void

  ): void => {
    const newData = data.get(id.toString());

    if (newData) {
      let initialState: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined = null;
      let initialConfig: SnapshotConfig<T, K> | null | undefined = null;
      if (newData.initialState instanceof SnapshotStore) {
        // Convert SnapshotStore to Snapshot
        initialState = convertSnapshotStoreToSnapshot(newData.initialState) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      } else if (newData.initialState === null || newData.initialState === undefined) {
        initialState = null;
      } else {
        // Convert initialState data to SnapshotStore
        initialState = convertMapToSnapshot(
          newData.initialState.data
            ? new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(Object.entries(newData.initialState.data))
            : new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
          newData.initialState.timestamp
        );
      }

      const versionInfo = createVersionInfo(newData.initialState);
      const snapshotItem: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        ...retrievedSnapshot,
        id: id.toString(),
        data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>().set(id.toString(), newData),
        initialState: initialState,
        initialConfig: initialConfig,
        removeSubscriber: removeSubscriber,
        onInitialize: onInitialize,
        onError: onError,
        snapshot: snapshot,

        setCategory: retrievedSnapshot.setCategory ?? ((category) => { /* Fallback */ }),
        applyStoreConfig: applyStoreConfig,
        snapshotData: snapshotData,
        getSnapshotItems: getSnapshotItems,

        defaultSubscribeToSnapshots: defaultSubscribeToSnapshots,
        versionInfo: versionInfo,
        transformSubscriber: transformSubscriber,
        transformDelegate: transformDelegate,

        getBackendVersion: getBackendVersion,

        getFrontendVersion: getFrontendVersion,

        fetchData: fetchData,

        defaultSubscribeToSnapshot: defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: handleSubscribeToSnapshot,
        removeItem: removeItem,
        getSnapshot: snapshotApi.getSnapshot,
        getSnapshotSuccess: getSnapshotSuccess,
        setItem: setItem,
        getItem: getItem,
        getDataStore: getDataStore,
        getDataStoreMap: getDataStoreMap,

        updateDataStatus: updateDataStatus,
        addDataSuccess: addDataSuccess,
        getDataVersions: getDataVersions,
        updateDataVersions: updateDataVersions,

        initializedState: initializedState,
        getAllKeys: getAllKeys,
        getAllItems: getAllItems,
        addDataStatus: addDataStatus,

        removeData: removeData,
        updateData: updateData,
        updateDataTitle: updateDataTitle,
        updateDataDescription: updateDataDescription,
        eventsDetails: [],

        eventRecords: {},

        timestamp: new Date(),
        events: {
          on: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            if (snapshotItem.data instanceof Map) {
              snapshotItem.data.forEach((item: Snapshot<T, K, StructuredMetadata<T, K>>) => {
                callback(item);
              });

              return () => {
                // Check if events and eventRecords are defined before accessing
                if (snapshotItem.events && snapshotItem.events.eventRecords) {
                  snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
                    (callbackItem: EventRecord<T, K, StructuredMetadata<T, K>>) => callbackItem.callback !== callback
                  );
                } else {
                  console.error("Events or eventRecords are not defined.");
                }
              };
            }
          },

          off: (
            event: string,
            callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
              unsubscribeDetails?: { // Make this parameter optional
                userId?: string;
                snapshotId?: string;
                unsubscribeType?: string;
                unsubscribeDate?: Date;
                unsubscribeReason?: string;
                unsubscribeData?: any;
            }) => void
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
              (record) => record.callback !== callback
            );
          },

          emit: (
            event: string,
            snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>,
            type: string,
            snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
            criteria: SnapshotWithCriteria<T, K>,
            category: Category
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event].forEach(record => record.callback(snapshot));
          },

          once: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            const onceCallback = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
              callback(snapshot);
              snapshotItem.events?.off(event, onceCallback);
            };
            snapshotItem.events?.on(event, onceCallback);
          },

          addRecord: (
            event: string,
            record: CalendarManagerStoreClass<T, K>,
            callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
          ) => {
            if (!snapshotItem.events) return;
            if (!snapshotItem.events.eventRecords) {
              snapshotItem.events.eventRecords = {};
            }
            if (!snapshotItem.events.eventRecords[event]) {
              snapshotItem.events.eventRecords[event] = [];
            }

            const eventRecord: EventRecord<T, K> = { 
              action: 'add',
              timestamp: new Date(),
              record, 
              callback 
          };
            
            snapshotItem.events.eventRecords[event].push(eventRecord);
          },

          removeAllListeners: (event?: string) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords) return;
            if (event) {
              delete snapshotItem.events.eventRecords[event];
            } else {
              snapshotItem.events.eventRecords = {};
            }
          },

          subscribe: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
            snapshotItem.events?.on(event, callback);
          },

          unsubscribe: (
            event: string,
            unsubscribeDetails: {
              userId: string;
              snapshotId: string;
              unsubscribeType: string;
              unsubscribeDate: Date;
              unsubscribeReason: string;
              unsubscribeData: any;
            },
            callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
          ) => {
            snapshotItem.events?.off(event, unsubscribeDetails, callback);
          },

          trigger: (
            event: string | SnapshotEvents<T, K>,
            snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>,
            type: string,
            snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          ) => {
            // Ensure the event can be used to access the event records
            const eventKey = typeof event === 'string' ? event : event.key; // Adjust to access key as necessary

            if (
              !snapshotItem.events ||
              !snapshotItem.events.eventRecords ||
              !snapshotItem.events.eventRecords[eventKey]
            ) {
              return;
            }
            // Assuming record has a known structure, define its type
            snapshotItem.events.eventRecords[eventKey].forEach((record: { callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void }) => {
              record.callback(snapshot);
            });
          },

          callbacks: {
            // Define the `onUpdate` event
            onUpdate: [
              (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
                // Process each snapshot
                if (snapshot.id !== undefined && snapshot.data) {
                  updateDataVersions(
                    Number(snapshot.id),
                    Array.from(snapshot.data.values())
                  );
                  const snapshotData = snapshot.data.get(snapshot.id);
                  if (snapshotData) {
                    updateDataStatus(
                      Number(snapshot.id),
                      snapshotData.status as StatusType | undefined
                    );
                    updateDataTitle(
                      Number(snapshot.id),
                      snapshotData.title as string
                    );
                    updateDataDescription(
                      Number(snapshot.id),
                      snapshotData.description as string
                    );
                    updateData(
                      Number(snapshot.id),
                      snapshotData as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
                    );
                  }
                }
              }
            ],
          },




          onSnapshotAdded: (event: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
            console.log("onSnapshotAdded", snapshot);
            if (updateSnapshot) {
              updateSnapshot(snapshot.id, status);
            } else {
              console.error("updateSnapshot is not defined");
            }
            this.updateSnapshot?.(snapshot.id);

            snapshot.id,
              snapshot.data,
              snapshot.events,
              snapshot.snapshotStore,
              snapshot.dataItems,
              snapshot,
              snapshot.payload,
              snapshot.store

            return snapshot;
          },

          onSnapshotUpdated: (
            snapshotId: string,
            snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
            events: Record<string, CalendarManagerStoreClass<T, K>[]>,
            snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
            newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotStore<any, K>
          ) => {
            console.log("onSnapshotUpdated", snapshot);

            // Add an explicit check to ensure `updateSnapshot` is defined
            if (this.updateSnapshot) {
              this.updateSnapshot(
                snapshotId,
                data,
                events,
                snapshotStore,
                dataItems,
                newData,
                payload,
                store
              );
            }
          },
          onSnapshotRemoved: (
            event: string,
            snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>,
            snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
            criteria: SnapshotWithCriteria<T, K>,
            category: Category
          ) => {
            console.log("onSnapshotRemoved", snapshot);

          },
          subscribers: [],
          eventIds: [],
        },
        meta: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
      };

      const snapshotData = snapshotItem.data?.get(id.toString());
      if (snapshotData) {
        data.set(id.toString(), snapshotData);
        dispatch(DataActions().addDataSuccess({ data: [snapshotItem] }));
      } else {
        dispatch(DataActions().addDataFailure({ error: "Invalid snapshot data" }));
      }
    } else {
      dispatch(DataActions().addDataFailure({ error: "Invalid data" }));
    }

  };  const updateDataVersions = (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    dispatch(
      DataActions().updateDataVersions({
        payload: {
          id,
          versions,
        },
        type: "updateDataVersions",
      })
    );
  };

  const getBackendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getBackendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching backend version:", error);
      throw error;
    }
  };

  const getFrontendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getFrontendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching frontend version:", error);
      throw error;
    }
  };

  const getAllKeys = async (): Promise<string[]> => {
    try {
      const response = await apiData.getAllKeys();
      return response;
    } catch (error) {
      console.error("Error fetching all keys:", error);
      throw error;
    }
  };

  // Define your snapshotMethods array
  const snapshotMethods: SnapshotStoreMethod<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [
    {
      snapshot: (
        id: string | number | undefined,
        snapshotId: string | null,
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        category: Category | undefined,        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        dataStore: DataStore<T, K>,
        dataStoreMethods: DataStoreMethods<T, K>,
        // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
        metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
        subscriberId: string, // Add subscriberId here
        endpointCategory: string | number,// Add endpointCategory here
        storeProps: SnapshotStoreProps<T, K>,
        snapshotConfigData: SnapshotConfig<T, K>,
        subscription: Subscription<T, K>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> => {
        try {
          if (id === undefined) {
            throw new Error("Invalid id: id is undefined");
          }
          const item = data.get(String(id));
          const snapshotConfig = snapshotConfigData || {};
          if (item && snapshotStoreConfigData !== undefined) {
            const snapshotItem: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = transformDataToSnapshot(item, snapshotConfig, snapshotStoreConfigData);

            // Call the callback with snapshotStore
            callback({
              addData: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => { }, // Implement addData logic
              getItem: (key: T) => {
                return new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve, reject) => {
                  try {
                    if (snapshotItem.data) {
                      resolve(snapshotItem.data.get(key)); // Safely access snapshotItem.data
                    } else {
                      resolve(undefined); // Handle case where snapshotItem.data is null or undefined
                    }
                  } catch (error) {
                    reject(error);
                  }
                });
              },
              id: undefined,
              key: '',
              keys: [],
              topic: '',
              date: undefined,
              operation: {
                operationType: "./data_analysis/frontend/buddease/src/app/snapshots/SnapshotActions".CreateSnapshot
              },
              title: '',
              category: undefined,
              categoryProperties: undefined,
              message: undefined,
              timestamp: undefined,
              createdBy: '',
              eventRecords: null,
              type: undefined,
              subscribers: [],
              createdAt: undefined,
              store: undefined,
              stores: null,
              snapshots: [],
              snapshotConfig: undefined,
              meta: {},
              snapshotMethods: undefined,
              getSnapshotsBySubscriber: undefined,
              getSnapshotsBySubscriberSuccess: undefined,
              getSnapshotsByTopic: undefined,
              getSnapshotsByTopicSuccess: undefined,
              getSnapshotsByCategory: undefined,
              getSnapshotsByCategorySuccess: undefined,
              getSnapshotsByKey: undefined,
              getSnapshotsByKeySuccess: undefined,
              getSnapshotsByPriority: undefined,
              getSnapshotsByPrioritySuccess: undefined,
              getStoreData: undefined,
              updateStoreData: undefined,
              updateDelegate: undefined,
              getSnapshotContainer: undefined,
              getSnapshotVersions: undefined,
              createSnapshot: undefined,
              criteria: undefined,
              getDataStoreMap: undefined,
              emit: undefined,
              removeChild: undefined,
              getChildren: undefined,
              hasChildren: undefined,
              isDescendantOf: undefined,
              getInitialState: undefined,
              getConfigOption: undefined,
              getTimestamp: undefined,
              getStores: undefined,
              getData: undefined,
              addStore: undefined,
              removeStore: undefined,
              createSnapshots: undefined,
              onSnapshot: undefined,
              getFirstDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              getInitialDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              transformSnapshot: function <
              U extends BaseDataEntity, 
              T extends BaseDataEntity>(snapshot: Snapshot<BaseDataEntity, T>): Snapshot<U, U> {
                throw new Error('Function not implemented.');
              },
              transformInitialState: function <
              U extends BaseDataEntity, 
              T extends BaseDataEntity>(initialState: InitializedState<BaseDataEntity, T>): InitializedState<U, U> {
                throw new Error('Function not implemented.');
              },
              restoreSnapshot: function <R>(
                id: string,
                snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                snapshotId: string,
                snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                savedState: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                category: Category | undefined,
                callback: (snapshot: T) => R, 
                snapshots: SnapshotsArray<T, K, Meta, ExcludedFields> ,
                type: string,
                event: string | SnapshotEvents<T, K>,
                subscribers: SubscriberCollection<T, K>,
                snapshotContainer?: T,
                snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseDataEntity, Meta>, T> | undefined
              ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
                try {
                  // Logic to restore the snapshot based on the provided snapshotData
                  console.log(`Restoring snapshot with ID: ${snapshotId}`);
          
                  // Check if the snapshot already exists in the array
                  const existingSnapshot = snapshots.find((s) => s.id === snapshotId);
          
                  if (existingSnapshot) {
                    console.log(`Snapshot with ID ${snapshotId} already exists. Restoring...`);
          
                    // Restore the snapshot data
                    const restoredSnapshot = { ...existingSnapshot, ...snapshotData };
          
                    // Optionally, you can update the category if provided
                    if (category) {
                      restoredSnapshot.category = category;
                    }
          
                    // Execute the callback with the restored snapshot data and get the returned value
                    const result = callback(restoredSnapshot.data);
          
                    // Return the restored snapshot
                    return restoredSnapshot;
                  } else {
                    console.warn(`No snapshot found with ID: ${snapshotId}`);
                    return null; // Return null if no snapshot found to restore
                  }
                } catch (error) {
                  console.error('Error restoring snapshot:', error);
                  return null; // Return null in case of an error
                }
              },
              snapshotStoreConfig: [],
              config: Promise.resolve(null),
              configs: [],
              items: [],
              dataStore: undefined,
              mapDataStore: undefined,
              snapshotStores: new Map(),
              initialState: undefined,
              name: '',
              schema: {},
              snapshotItems: [],
              nestedStores: [],
              snapshotIds: [],
              dataStoreMethods: undefined,
              delegate: [],
              getConfig: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
                throw new Error('Function not implemented.');
              },
              setConfig: function (config: Promise<SnapshotStoreConfig<T, K, Meta, never>>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              ensureDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              getSnapshotItems: function (): (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K> | undefined)[] {
                throw new Error('Function not implemented.');
              },
              handleDelegate: function <T extends (...args: any[]) => any, R = ReturnType<T>>(method: (delegate: any) => T, ...args: Parameters<T>): R | undefined {
                throw new Error('Function not implemented.');
              },
              notifySuccess: function (message: string): void {
                throw new Error('Function not implemented.');
              },
              notifyFailure: function (message: string): void {
                throw new Error('Function not implemented.');
              },
              findSnapshotStoreById: function (storeId: number): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
                throw new Error('Function not implemented.');
              },
              defaultSaveSnapshotStore: function (store: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              saveSnapshotStore: function (store: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              findIndex: function (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): number {
                throw new Error('Function not implemented.');
              },
              splice: function (index: number, count: number): void {
                throw new Error('Function not implemented.');
              },
              events: undefined,
              subscriberId: undefined,
              length: undefined,
              content: undefined,
              value: undefined,
              todoSnapshotId: undefined,
              snapshotStore: null,
              dataItems: [],
              newData: null,
              storeId: 0,
              addSnapshotToStore: function (storeId: number, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStoreData: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, subscribers: SubscriberCollection<T, K>): Promise<{ snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
                throw new Error('Function not implemented.');
              },
              addSnapshotItem: function (item: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K>): void {
                throw new Error('Function not implemented.');
              },
              addNestedStore: function (store: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null, snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): void {
                throw new Error('Function not implemented.');
              },
              defaultCreateSnapshotStores: function (id: string, 
                snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                snapshotManager: SnapshotManager<T, K>,
                payload: CreateSnapshotStoresPayload<T, K>,
                callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, 
                snapshotStoreData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, 
                category?:  Category,
                snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[] | undefined
              ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
                throw new Error('Function not implemented.');
              },
              createSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotStoresPayload<T, K>, callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotStoreData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, category?:  Category, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              subscribeToSnapshots: function (
                snapshotId: string,
                callback: (snapshots: Snapshots<T, K>

                ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): null {
                throw new Error('Function not implemented.');
              },
              subscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              defaultOnSnapshots: function (snapshotId: string, snapshots: Snapshots<T, K>, type: string, event: Event, callback: (snapshots: Snapshots<T, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              onSnapshots: function (snapshotId: string, snapshots: Snapshots<T, K>, type: string, event: Event, callback: (snapshots: Snapshots<T, K>) => void): Promise<void | null> {
                throw new Error('Function not implemented.');
              },
              transformSubscriber: function (sub: Subscriber<T, K>): Subscriber<T, K> {
                throw new Error('Function not implemented.');
              },
              isCompatibleSnapshot: function (snapshot: any): snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              isSnapshotStoreConfig: function (item: any): item is SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              transformDelegate: function (): SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[] {
                throw new Error('Function not implemented.');
              },
              getSaveSnapshotStore: function (id: string, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotStoresPayload<T, K>, callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotStoreData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, category?:  Category, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              getConfigs: function (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotStoresPayload<T, K>, callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotStoreData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, category?:  Category, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              getSaveSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotStoresPayload<T, K>, callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotStoreData?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, category?:  Category, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[] | undefined): void {
                throw new Error('Function not implemented.');
              },
              initializedState: undefined,
              transformedDelegate: [],
              transformedSubscriber: function (sub: Subscriber<T, K>): Subscriber<BaseData, K> {
                throw new Error('Function not implemented.');
              },
              getSnapshotIds: [],
              getNestedStores: [],
              getFindSnapshotStoreById: undefined,
              getAllKeys: function (storeId: number, snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: T): Promise<string[] | undefined> {
                throw new Error('Function not implemented.');
              },
              mapSnapshot: function (
                id: number,
                storeId: string | number,
                snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                snapshotId: string,
                criteria: CriteriaType,
                snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                type: string,
                event: Event
              ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
                throw new Error('Function not implemented.');
              },
              getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | undefined {
                throw new Error('Function not implemented.');
              },
              addDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              removeData: function (id: number): void {
                throw new Error('Function not implemented.');
              },
              updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              updateDataTitle: function (id: number, title: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataDescription: function (id: number, description: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
                throw new Error('Function not implemented.');
              },
              getDataVersions: function (id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
                throw new Error('Function not implemented.');
              },
              updateDataVersions: function (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
                throw new Error('Function not implemented.');
              },
              getBackendVersion: function (): IHydrateResult<number> | Promise<string> {
                throw new Error('Function not implemented.');
              },
              getFrontendVersion: function (): Promise<string | number | undefined> {
                throw new Error('Function not implemented.');
              },
              fetchData: function (id: number): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                throw new Error('Function not implemented.');
              },
              defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
                throw new Error('Function not implemented.');
              },
              handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              snapshot: undefined,
              removeItem: function (key: string): Promise<void> {
                throw new Error('Function not implemented.');
              },
              getSnapshot: function (
                snapshot: (id: string | number) => Promise<{
                  snapshotId: number;
                  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                  category: Category | undefined;
                  categoryProperties: CategoryProperties | undefined;
                  dataStoreMethods: DataStore<T, K> | null;
                  timestamp: string | number | Date | undefined;
                  id: string | number | undefined;
                  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                  snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                  data: T;
                }> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
                throw new Error('Function not implemented.');
              },
              getSnapshotById: function (
                snapshot: (id: string) => Promise<{ 
                  category: Category | undefined; 
                  categoryProperties: CategoryProperties; 
                  timestamp: string | number | Date | undefined; 
                  id: string | number | undefined;
                  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                  snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                  data: SnapshotUnion<BaseData, Meta>; 
                }> | undefined
              ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
                throw new Error('Function not implemented.');
              },
              getSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K>[]): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              },
              getSnapshotId: function (key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<string | undefined> {
                throw new Error('Function not implemented.');
              },
              getSnapshotArray: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                throw new Error('Function not implemented.');
              },
              setItem: function (key: string, value: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              addSnapshotFailure: function (date: Date, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              getDataStore: function (): Promise<InitializedDataStore<T>> {
                throw new Error('Function not implemented.');
              },
              addSnapshotSuccess: function (snapshot: T, subscribers: SubscriberCollection<T, K>): void {
                throw new Error('Function not implemented.');
              },
              getParentId: function (id: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null {
                throw new Error('Function not implemented.');
              },
              getChildIds: function (id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string[] {
                throw new Error('Function not implemented.');
              },
              addChild: function (parentId: string, childId: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              compareSnapshotState: function (stateA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null | undefined, stateB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined): boolean {
                throw new Error('Function not implemented.');
              },
              deepCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              shallowCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              getDataStoreMethods: function (): DataStoreMethods<T, K> {
                throw new Error('Function not implemented.');
              },
              getDelegate: function (
                context: { useSimulatedDataSource: boolean; 
                simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 
              }
              ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                throw new Error('Function not implemented.');
              },
              determineCategory: function (snapshot: string | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined): string {
                throw new Error('Function not implemented.');
              },
              determineSnapshotStoreCategory: function (storeId: number, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): string {
                throw new Error('Function not implemented.');
              },
              determinePrefix: function (snapshot: T | null | undefined, category: string): string {
                throw new Error('Function not implemented.');
              },
              updateSnapshot: function (snapshotId: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, events: Record<string, CalendarManagerStoreClass<T, K>[]>, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: UpdateSnapshotPayload<T>, store: SnapshotStore<any, K>, callback?: ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) | undefined): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
                throw new Error('Function not implemented.');
              },
              updateSnapshotSuccess: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotFailure: function ({ snapshotManager, snapshot, date, payload, }: { snapshotManager: SnapshotManager<T, K>; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; date: Date | undefined; payload: { error: Error; }; }): void {
                throw new Error('Function not implemented.');
              },
              removeSnapshot: function (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              addSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, subscribers: SubscriberCollection<T, K> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
                throw new Error('Function not implemented.');
              },
              createInitSnapshot: function (id: string, initialData: T, snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: Category): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              },
              createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshotSuccess: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshotFailure: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
                throw new Error('Function not implemented.');
              },
              createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotSuccess: function (snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: ((data: Subscriber<T, K>) => void)[]): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotFailure: function (error: Error): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T, K>) => void): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsFailure: function (error: Payload): void {
                throw new Error('Function not implemented.');
              },
              initSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshotId: number, snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, callback: (snapshotStore: SnapshotStore<any, any>) => void): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers?: Subscriber<T, K>[] | undefined): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
                throw new Error('Function not implemented.');
              },
              takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshotsSuccess: function (snapshots: T[]): void {
                throw new Error('Function not implemented.');
              },
              configureSnapshotStore: function (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, storeId: number, 
                data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, events: Record<string, CalendarManagerStoreClass<T, K>[]>,
                 dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                 payload: ConfigureSnapshotStorePayload<T, K>,
                  store: SnapshotStore<any, K>,
                   callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

                  ) => void): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotStore: function (
                snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                snapshotId: string, 
                data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, 
                events: Record<string, CalendarManagerStoreClass<T, K>[]>, 
                dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], 
                newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                payload: ConfigureSnapshotStorePayload<T, K>,
                store: SnapshotStore<any, K>,
                callback: (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
                throw new Error('Function not implemented.');
              },
              flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => U): U extends (infer I)[] ? I[] : U[] {
                throw new Error('Function not implemented.');
              },
              setData: function (data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
                throw new Error('Function not implemented.');
              },
              getState: function () {
                throw new Error('Function not implemented.');
              },
              setState: function (state: any): void {
                throw new Error('Function not implemented.');
              },
              validateSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
                throw new Error('Function not implemented.');
              },
              handleSnapshot: function (id: string, snapshotId: number, snapshot: T | null, snapshotData: T, category: Category | undefined, categoryProperties: CategoryProperties | undefined, callback: (snapshot: T) => void, snapshots: SnapshotsArray<T, K, Meta, ExcludedFields> , type: string, event: Event, snapshotContainer?: T | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
                throw new Error('Function not implemented.');
              },
              handleActions: function (action: (selectedText: string) => void): void {
                throw new Error('Function not implemented.');
              },
              setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
                throw new Error('Function not implemented.');
              },
              transformSnapshotConfig: function <U extends BaseData>(config: SnapshotConfig<U, U>): SnapshotConfig<U, U> {
                throw new Error('Function not implemented.');
              },
              setSnapshotData: function (snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, subscribers: Subscriber<T, K>[], snapshotData: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              },
              filterInvalidSnapshots: function (snapshotId: string, state: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              },
              setSnapshots: function (snapshots: Snapshots<T, K>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshot: function (): void {
                throw new Error('Function not implemented.');
              },
              mergeSnapshots: function (snapshots: Snapshots<T, K>, category: string): void {
                throw new Error('Function not implemented.');
              },
              reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U): U | undefined {
                throw new Error('Function not implemented.');
              },
              sortSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              filterSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              mapSnapshotsAO: function (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: T): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              },
              mapSnapshots: function <U>(storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: T, callback: (storeIds: number[], snapshotId: string, category: Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: K, index: number) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<SnapshotsArray<T, K, Meta, ExcludedFields> > {
                throw new Error('Function not implemented.');
              },
              findSnapshot: function (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
                throw new Error('Function not implemented.');
              },
              getSubscribers: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T, K>; }> {
                throw new Error('Function not implemented.');
              },
              notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
                throw new Error('Function not implemented.');
              },
              notifySubscribers: function (message: string, subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Subscriber<T, K>[] {
                throw new Error('Function not implemented.');
              },
              subscribe: function (snapshotId: string, unsubscribe: UnsubscribeDetails, subscriber: Subscriber<T, K> | null, data: T, event: Event, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): [] | SnapshotsArray<T, K, Meta, ExcludedFields>  {
                throw new Error('Function not implemented.');
              },
              unsubscribe: function (callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshot: function (callback: (
                snapshotId: string,
                payload: FetchSnapshotPayload<T, K>,
                snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                payloadData: Data<T> | T,
                category: Category | undefined, 
                categoryProperties: CategoryProperties | undefined, 
                timestamp: Date, 
                data: T,
                delegate: SnapshotWithCriteria<T, K>[]
              ) => void
              ): Promise<{
                id: any; 
                category: Category | undefined; 
                categoryProperties: CategoryProperties; 
                timestamp: any; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
                data: T; 
                getItem?: (
                  (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

                ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
                ) 
                | undefined;
              }> {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotSuccess: function (snapshotData: (snapshotManager: SnapshotManager<T, K>, subscribers: Subscriber<T, K>[], snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, date: Date | undefined, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              getSnapshots: function (category: string, data: Snapshots<T, K>): void {
                throw new Error('Function not implemented.');
              },
              getAllSnapshots: function (
                snapshotId: string,
                snapshotData: T,
                 timestamp: string,
                  type: string,
                  event: Event, 
                  id: number,
                  snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                  category: symbol | string | Category | undefined, 
                  categoryProperties: CategoryProperties | undefined, 
                  dataStoreMethods: DataStore<T, K>, 
                  data: T, 
                  filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
                  dataCallback?: ((
                    subscribers: Subscriber<T, K>[], 
                    snapshots: Snapshots<T, K>
                  ) => Promise<Snapshots<T, K>>) | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                throw new Error('Function not implemented.');
              },
              getSnapshotStoreData: function (
                snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                snapshotId: string,
                snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
              ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
                throw new Error('Function not implemented.');
              },
              generateId: function (): string {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshots: function (
                criteria: CriteriaType,
              snapshotData: (
                snapshotIds: string[],
                subscribers: SubscriberCollection<T, K>,
                snapshots: Snapshots<T, K>
              ) => Promise<{
                subscribers: SubscriberCollection<T, K>;
                snapshots: Snapshots<T, K>; // Include snapshots here for consistency
              }>): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshotsRequest: function (snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsRequest: function (
                snapshotData: (subscribers: Subscriber<T, K>[]
                ) => Promise<{
                  subscribers: Subscriber<T, K>[]; 
                snapshots: Snapshots<T, K>; 
              }>
            ): Promise<void> {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>): void {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsFailure: function (date: Date, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsFailure: function (date: Date, snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshot: function (snapshotId: string, snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshots: Snapshots<T, K>): Promise<{ snapshots: Snapshots<T, K>; }> {
                throw new Error('Function not implemented.');
              },
              handleSnapshotSuccess: function (
                message: string, 
                snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
                snapshotId: string
              ): void {
                throw new Error('Function not implemented.');
              },
              isExpired: function (): boolean | undefined {
                throw new Error('Function not implemented.');
              },
              compress: function (): void {
                throw new Error('Function not implemented.');
              },
              auditRecords: [],
              encrypt: function (): void {
                throw new Error('Function not implemented.');
              },
              decrypt: function (): void {
                throw new Error('Function not implemented.');
              },
              [Symbol.iterator]: function (): IterableIterator<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
                throw new Error('Function not implemented.');
              }
            });
            // Return the snapshotItem
            return Promise.resolve({ snapshot: snapshotItem });
          } else {
            // Handle case where item is not found
            throw new Error("Item not found");
          }
        } catch (error) {
          console.error("Error in snapshot method:", error);
          throw error; // Propagate the error
        }
      },
      // Add other methods and properties as needed
    }
  ];

  const { versionNumber } = getCurrentAppInfo();

  return {
    id: "",
    metadata: "",
    config: {} as Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
    convertKeyToT: (key: string) => T,
   
    getSubscribers: (): Promise<{ 
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshots<T, K>; 
    }> => {},
    getSnapshotByKey: (storeId: number, snapshotKey: string): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined> =>{},
    
    mapSnapshot: (
      id: number,
      storeId: string | number,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      criteria: CriteriaType,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined> => { },
    
    mapSnapshots: (
      storeId: number,
      snapshotId: string,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<any, any>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<any, any>,
      data: any,
      // snapshotsArray: SnapshotsArray<any>,
      // snapshotsObject: SnapshotsObject<any>
    ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
    
    mapSnapshotStore: (
      storeId: number,
      snapshotId: string,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<any, any>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<any, any>,
      data: any,
      // snapshotsArray: SnapshotsArray<any>,
      // snapshotsObject: SnapshotsObject<any>
    ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
    getSuubscribers: (
      snapshotId: string,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T
    ): Promise<Subscriber<T, K>[]> => {},
    getSubscribersWithFilters: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      category?: symbol | string | Category,
      categoryProperties?: CategoryProperties,
      timestamp?: string | number | Date,
    ): Promise<Subscriber<T, K>[]> => {},

    determineSnapshotStoreCategory: (
      storeId: number,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => "",
   

    getDataWithSearchCriteria: (id: number): Promise<SnapshotWithCriteria<T, K> | undefined>  => {},
    initializedState: {},
    getStoreData: (id: number): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {},
    updateStoreData: (
      data: Data<T>,
      id: number,
      newData: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {},
   
    getAllData: (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {},
    defaultSubscribeToSnapshot:  (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
    handleSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
    getDelegate: (
      context: { useSimulatedDataSource: boolean; 
      simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 
    }
    ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
      throw new Error('Function not implemented.');
    },
   
    updateDelegate: (
      delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {},
  
    getSnapshot: (
      snapshot: (id: string | number) =>
        | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          category: Category | undefined;
          categoryProperties: CategoryProperties;
          dataStoreMethods: DataStore<T, K>;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
        }>
        | undefined
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
    
    getSnapshotWithCriteria: (
      category: Category | undefined,      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
    ): Promise<SnapshotWithCriteria<T, K> | undefined> => {},
  
    getSnapshotContainer: (
      category: string, // Adjusted to more specific type
      timestamp: string, // Adjusted to more specific type
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Data<T>,
      snapshotsArray: SnapshotsArray<T, K, Meta, ExcludedFields> ,
      snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {},
   
    getSnapshotVersions: (
      category: Category | undefined,      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {},
    // storage: SnapshotStore<T> | undefined;
    getSnapshotWithCriteriaVersions: (
      category: Category | undefined,      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T
    ): Promise<SnapshotWithCriteria<T, K>[] | undefined> => {},
    dataStoreConfig: {},
    subscribers: "",
   
    snapshotSubscriberId: "",

    //subscriber management
    isSubscribed: false,
    notifySubscribers: "",
    notify: "",
   
    subscribe: "",
    subscribeToSnapshot: "",
    subscribeToSnapshotList: "",
    unsubscribeFromSnapshot: "",
   
    subscribeToSnapshotsSuccess: "",
    unsubscribeFromSnapshots: "",
    unsubscribe: "",
    subscribeToSnapshots: "",
   
    clearSnapshot: "",
    clearSnapshotSuccess: "",
    addToSnapshotList: "",
    removeSubscriber: "",
   
    addSnapshotSubscriber: "",
    removeSnapshotSubscriber: "",
    transformSubscriber: "",
    defaultSubscribeToSnapshots: "",
   
    getSnapshotsBySubscriber: "",
    getSnapshotsBySubscriberSuccess: "",
    find: "",
    storeId: "",
   
    configId: "",
    operation: "",
    autoSave: "",
    syncInterval: "",
   


    data,
    fetchData,
    addData,
    removeData,
    updateData,
    getItem,
    setItem,
    removeItem,
    getAllItems,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    addDataStatus,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion,
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {},
    getData: fetchData,
    getAllKeys,
    snapshotMethods
  };
};

export { createDataStore, createEventManager, initializeState, useDataStore };
export type { CommonDataStoreMethods, ConfigurableSnapshotStore, EventManager, EventRecord, InitializedState, VersionedData };

