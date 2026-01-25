// createSnapshotOptions.ts
import { getSubscribersAPI } from "@/core/api/subscriberApi";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SharedIdentifiers } from '@/core/documents/RelatedProps';
import type { SnapshotStoreOptions } from "@/core/hooks/useSnapshotManager";
import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { getOrSetCategoryForSnapshot } from "@/core/libraries/categories/generateCategoryProperties";
import type { Data } from '@/core/models/data/Data';
import { displayToast } from "@/core/models/display/ShowToast";
import type { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { CriteriaType } from "@/core/pages/searches/CriteriaType";
import type { DataStoreWithSnapshotMethods } from "@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import type { getCurrentSnapshotConfigOptions } from "@/core/snapshots/getCurrentSnapshotConfigOptions";
import { handleSnapshotOperation } from "@/core/snapshots/handleSnapshotOperation";
import type { SnapshotOperation } from "@/core/snapshots/index";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotContainerType } from '@/core/snapshots/SnapshotContainer';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import { configureSnapshot } from '@/core/snapshots/snapshotOperations';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { snapshotStoreConfigInstance } from '@/core/snapshots/snapshotStoreConfigInstance';
import type { InitializedData, SnapshotInstanceProps } from '@/core/snapshots/SnapshotStoreOptions';
import type { storeProps } from "@/core/snapshots/SnapshotStoreProps";
import type { SnapshotStoreReference } from "@/core/snapshots/SnapshotStoreReference";
import type { DataStore, InitializedState, initializeState } from '@/core/state/stores/DataStore';
import type { useDataStore } from '@/core/state/stores/DataStore';
import type { SubscribeResult } from '@/core/subscribers/Subscriber';
import type { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import { subscribeToSnapshotImpl } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { addToSnapshotList, category } from '@/utils/snapshotUtils';
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import SnapshotStore from "./SnapshotStore";

interface SimulatedDataSource<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> extends
  SnapshotInstanceProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedIdentifiers<T, K>  {
  // Define the properties of the simulated data source
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
>(options?: InitializedStateOptions): InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
      return configureSnapshot(id, storeId, snapshotId, dataStoreMethods, category, callback, snapshotData, snapshotStoreConfig, subscribers);
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
