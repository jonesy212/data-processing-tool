// createSnapshotOptions.ts
import { getSubscribersAPI } from "@/app/api/subscriberApi";
import { SharedIdentifiers } from '@/app/documents/SharedIdentifiers';
import { SnapshotStoreOptions } from "@/app/hooks/useSnapshotManager";
import { Category, getOrSetCategoryForSnapshot } from "@/app/libraries/categories/generateCategoryProperties";
import { displayToast } from "@/app/models/display/ShowToast";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStore, InitializedState, initializeState, useDataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { configureSnapshot } from '@/app/snapshots/snapshotOperations';
import { snapshotStoreConfigInstance } from '@/app/snapshots/snapshotStoreConfigInstance';
import { InitializedData, SnapshotInstanceProps } from '@/app/snapshots/SnapshotStoreOptions';
import { storeProps } from "@/app/snapshots/SnapshotStoreProps";
import { SubscriberCollection } from "@/app/subscribers/SubscriberCollection";
import { subscribeToSnapshotImpl } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { addToSnapshotList, category } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SubscribeResult } from '@/users/Subscriber';
import { SnapshotData } from ".";
import { SnapshotOperation } from "../actions/SnapshotActions";
import { Attachment } from "../documents/attachment/Attachment";
import { getCurrentSnapshotConfigOptions } from "./getCurrentSnapshotConfigOptions";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreReference } from "./SnapshotStoreReference";

interface SimulatedDataSource<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> extends
  SnapshotInstanceProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedIdentifiers  {
  // Define the properties of the simulated data source
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  fetchData: () => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  // You can add more properties if needed
}

interface InitializedStateOptions {
  asMap?: boolean; // default false
}


function getDefaultInitializedState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(options?: InitializedStateOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  if (options?.asMap) {
    return new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
  }

  return {
    data: {} as T,
    meta: {} as Meta,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
  } as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Example getDefaultSnapshotStoreConfig function if missing
function getDefaultSnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Provide a proper default value
}


function createSnapshotOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    snapshotObj: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: (
      id: string | number | undefined,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      criteria: CriteriaType,
    // snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string | null,
      category?: Category,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Optional parameter for SimulatedDataSource
): SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const dataMap = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
  // Assuming `snapshot` has a unique identifier or key to be added to the Map
  const snapshotId = snapshotObj.id ? snapshotObj.id.toString() : '';
  dataMap.set(snapshotId, snapshotObj);

  const snapshotStoreConfig = useDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().snapshotStoreConfig

  // Convert snapshotStoreConfig.snapshotStores (Map) to array if needed
  let normalizedSnapshotStores: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  if (snapshotStoreConfig?.snapshotStores instanceof Map) {
    normalizedSnapshotStores = Array.from(snapshotStoreConfig.snapshotStores.values());
  } else if (Array.isArray(snapshotStoreConfig?.snapshotStores)) {
    normalizedSnapshotStores = snapshotStoreConfig.snapshotStores;
  }

  const normalizedConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...snapshotStoreConfig,
    snapshotStores: normalizedSnapshotStores,
  } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  const config = snapshotStoreConfig ?? getDefaultSnapshotStoreConfig();
  if (!config) {
    throw new Error('snapshotStoreConfig and getDefaultSnapshotStoreConfig() cannot both be undefined');
  }

  const { callback, payload, endpointCategory } = storeProps
  const subscribers = getSubscribersAPI<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(); // Await to get the actual data

  const defaultSimulatedDataSource: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    name: "DefaultSimulatedDataSource",
    schema: {}, // Add appropriate schema
    expirationDate: new Date(), // Provide valid expiration
    operation: {} as SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Example operation
    // Extract snapshots as Map<string, Snapshot<T,K>>
    data: normalizedConfig as unknown as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    fetchData: async () => normalizedConfig,
    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties?: CategoryProperties | undefined,
      callback?: ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void),
      snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
      return configureSnapshot(id, category, callback, snapshotData, snapshotStoreConfig, subscribers);
    },
    createdAt: new Date(), // Ensure proper timestamp initialization
    updatedAt: new Date(), // Ensure proper timestamp initialization
    storeId: `store_${Date.now()}`, // Generate a unique store ID
    category: category ?? "default", // Default category if not provided
    callback: callback ?? (() => { }), // Default empty function to avoid undefined errors
    subscribeToSnapshots: (
      snapshotStore,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      snapshots,
      callback
    ): SubscribeResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
      // Use fetchedSubscribers or fallback to empty array
      const subs = getSubscribersAPI() ?? [];
      // Example: loop through subscribers and call callback
      subs.forEach(sub => {
        callback(snapshotStore, snapshots);
      });

      // Return null or whatever your SubscribeResult expects
      return null;
    },

  };

  let initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

  // Use snapshotObj.initialState if available
  if (snapshotObj.initialState) {
    const initialized = initializeState(snapshotObj.initialState);
    // Only assign if it's a valid type
    if (initialized instanceof Map || initialized instanceof SnapshotStore || Array.isArray(initialized) || initialized instanceof Snapshot) {
      initialState = initialized;
    } else if (initialized === null || initialized === undefined) {
      initialState = getDefaultInitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    } else {
      // If it's a plain object or T, cast safely
      initialState = initialized as T;
    }
  } else {
    initialState = getDefaultInitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  }


  return {
    data: dataMap ? ({} as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) : undefined,
    initialState: snapshotObj.initialState ? initializeState(snapshotObj.initialState) : {} as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: snapshotObj.id ? snapshotObj.id.toString() : "",
    category: {
      id: "",
      type: "",
      chartType: "",
      dataProperties: [],
      formFields: [],

      name:
        typeof snapshotObj.category === "string"
          ? snapshotObj.category
          : "default-category",
      description: "",
      icon: "",
      color: "",
      iconColor: "",
      isActive: false,
      isPublic: false,
      isSystem: false,
      isDefault: false,
      isHidden: false,
      isHiddenInList: false,
      UserInterface: [],
      DataVisualization: [],
      Forms: undefined,
      Analysis: [],
      Communication: [],
      TaskManagement: [],
      Crypto: [],
      brandName: "",
      brandLogo: "",
      brandColor: "",
      brandMessage: "",
    },
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: snapshotObj.subscribeToSnapshots,
    subscribeToSnapshot: subscribeToSnapshotImpl,
    delegate: () => Promise.resolve([]), // Changed to a function returning a Promise
    getDelegate: snapshotObj.getDelegate,
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Provide actual data store methods
    getDataStoreMethods: () => ({} as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    snapshotMethods: [], // Provide appropriate default or derived snapshotMethods
    configOption: null, // Provide default or derived configOption

    handleSnapshotOperation: handleSnapshotOperation, // Added handleSnapshotOperation
    displayToast: displayToast, // Added displayToast
    addToSnapshotList: addToSnapshotList, // Added addToSnapshotList
    eventRecords: {}, // Changed to an empty object to match Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
    snapshotStoreConfig: snapshotStoreConfigInstance, // Added snapshotDelegate
    handleSnapshotStoreOperation: handleSnapshotStoreOperation, // Added handleSnapshotStoreOperation
    simulatedDataSource: simulatedDataSource || defaultSimulatedDataSource, // Use provided or default
    getCategory: getOrSetCategoryForSnapshot,
    getSnapshotConfig: getCurrentSnapshotConfigOptions,
  };

} export default createSnapshotOptions;
export type { SimulatedDataSource };
