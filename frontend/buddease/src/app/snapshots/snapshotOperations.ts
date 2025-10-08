// snapshotOperations.ts
import { EnhancedSnapshotData } from '@/app/api/processSnapshotData';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from "@/app/models/content/AddContent";
import { BaseData, Data } from '@/app/models/data/Data';
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { ExcludedFields } from '@/app/routing/Fields';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { InitializedData, SnapshotStoreOptions } from '@/app/snapshots/SnapshpshotStoreOptions';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshpshotWithCriteria';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { convertSnapshotContainerToStore } from "@/app/typings/YourSpecificSnapshotType";
import { createVersionInfo } from "@/app/versions/createVersionInfo";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { UpdateSnapshotPayload } from "@/server/database/Payload";
import { SchemaField } from '@/server/database/SchemaField';
import { UpdateSnapshotParams } from '@/UpdateSnapshotParams';
import { SubscriberCollection } from '@/users/SubscriberCollection';
import { VersionData } from '@/versions/VersionData';
import { SnapshotContainer, SnapshotStoreProps } from ".";
import { Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { SnapshotOperation } from "./SnapshotActions";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotOperations<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Existing methods
  mapSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  events: any[];
  parentId: string;
  childIds?: K[];

  // New methods
  getParentId: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string | null;
  getChildIds(id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): (string | number | undefined)[]
  clearSnapshotFailure: () => unknown;
  validateSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  getSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  takeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>;
  removeSnapshot: (snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: UpdateSnapshotPayload<Data<T>>,
    store: SnapshotStore<any, BaseData>
  ) => Promise<{ snapshot: Snapshot<any, Data<T>>; }>;
  getSnapshots: (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  getSnapshotItems: (category: symbol | string | Category | undefined, snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{ snapshots: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }>;
  getSnapshotContainer: (
    id: string | number,
    snapshotFetcher: (id: string | number) => Promise<{
      category: string;
      timestamp: string;
      id: string;
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      data: Data<T>;
      newData: Data<T>;
      unsubscribe: () => void;
      addSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
      createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      createSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
      updateSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
      batchUpdateSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      createSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchTakeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      deleteSnapshot: (id: string) => void;
      batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
      filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      getSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      removeSnapshot: (id: string) => void;
      removeSnapshots: (ids: string[]) => void;
      removeSnapshotsSuccess: (ids: string[]) => void;
      removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
      resetSnapshotData: () => void;
    }>
  ) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    data: Data<T>;
    newData: Data<T>;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    createSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    getSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
  }>;


  // New methods from the provided logic
  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: BaseData<any>,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined, categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: BaseData<any>,
      index: number
    ) => SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  getSnapshotById: (
    fetchSnapshot: (id: string) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: Data<T>;
    } | undefined>,
    id: string,
    snapshotProvider: (data: {
      id: string | number | undefined;
      category: Category;
      timestamp: string | number | Date | undefined;
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: Data<T>;
    }) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

  handleSnapshot: (
    id: string,
    snapshotId: string,
    data: Data<T, K, Meta> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotData: BaseData<any>,
    category: Category | undefined,
    callback: (snapshot: Data<T>) => void,
    snapshots: SnapshotsArray<any, Meta>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;


  configureSnapshot: <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
    id: string,
    category?: Category,
    callback?: ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) | undefined,
    snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| undefined,
    subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;


  preDelete?: (id: string, config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined) => Promise<void>;
  postDelete?: (id: string) => Promise<void>;
}


const getParentId = (
  id: string,
  snapshot: Snapshot<BaseData<any, any>, BaseData>
): string | null => {
  return snapshot.parentId || null;
};

const getChildIds = (
  id: string,
  childSnapshot: Snapshot<BaseData<any, any>, BaseData>
): BaseData<any, any, StructuredMetadata<any, any>>[] => {
  return childSnapshot.childIds || [];
};

const clearSnapshotFailure = (): unknown => {
  return { success: true };
};

const mapSnapshots = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  storeIds: number[],
  snapshotId: string,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  timestamp: string | number | Date | undefined,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  id: number,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  data: T,
  callback: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined, categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    index: number
  ) => SnapshotUnion<T, K, Meta>
): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];

  for (let i = 0; i < storeIds.length; i++) {
    const snapshotObject = callback(
      storeIds,
      snapshotId,
      category,
      categoryProperties,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data,
      i
    );
    snapshotsArray.push(snapshotObject);
  }

  return snapshotsArray;
};

const getSnapshotById = <
  T extends BaseDataEntity = BaseDataRoot,
// K extends T = T,
// Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  fetchSnapshot: (id: string) => Promise<{
    category: Category;
    timestamp: string | number | Date | undefined;
    id: string | number | undefined;
    snapshotStore: SnapshotStore<BaseData<any>, BaseData>;
    data: Data<T>;
  } | undefined>,
  id: string,
  snapshotProvider: (data: {
    id: string | number | undefined;
    category: Category;
    timestamp: string | number | Date | undefined;
    snapshotStore: SnapshotStore<BaseData<any>, BaseData>;
    data: Data<T>;
  }) => Snapshot<BaseData<any>, BaseData> // This provider generates Snapshot instances
): Promise<Snapshot<BaseData<any>, BaseData> | null> => {
  // Ensure fetchSnapshot is defined
  if (!fetchSnapshot) {
    console.error("fetchSnapshot is undefined");
    return Promise.resolve(null); // Return null immediately
  }

  return fetchSnapshot(id)
    .then(snapshotData => {
      // Check if snapshotData is defined and properly typed
      if (!snapshotData) return null;

      // Check that snapshotProvider is a valid function
      if (typeof snapshotProvider !== 'function') {
        console.error("snapshotProvider is not a function");
        return null;
      }

      // Use the snapshotProvider to create a Snapshot instance
      return snapshotProvider({
        id: snapshotData.id,
        category: snapshotData.category,
        timestamp: snapshotData.timestamp,
        snapshotStore: snapshotData.snapshotStore,
        data: snapshotData.data,
      });
    })
    .catch(error => {
      console.error("Error fetching snapshot:", error);
      return null;
    });
};


const handleSnapshot = <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  id: string,
  snapshotId: string,
  data: T | null,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotData: BaseData<any>,
  category: Category | undefined,
  callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  snapshots: SnapshotsArray<any, Meta>,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {

  try {

    // Ensure snapshot is not null and process it into the expected format
    if (snapshot === null) return Promise.resolve(null);

    // Ensure snapshotStore is a SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    let snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

    if (storeProps === undefined) {
      throw new Error("cannot find store properties")
    }
    const { storeId, name, version, schema, options, category, config, expirationDate,
      payload, callback, endpointCategory,
      operation,

    } = storeProps;

    if (snapshot) {
      callback(snapshot);
    }

    if (snapshotContainer) {
      // Ensure snapshotContainer is of the correct type, otherwise use a default instance
      snapshotStore = convertSnapshotContainerToStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotContainer);

    } else if (snapshotStoreConfig && snapshotStoreConfig.config !== null) {

      let versionInfo: string | VersionData<BaseData<any>, BaseData<any>>;

      if (typeof snapshotStoreConfig.version === "string") {
        versionInfo = createVersionInfo(snapshotStoreConfig.version);
      } else if (snapshotStoreConfig.version) {
        // convert VersionImpl -> VersionData explicitly
        const { author, user, notes, changes } = snapshotStoreConfig.version;
        versionInfo = createVersionInfo({
          author,
          user,
          notes,
          changes,
          version: snapshotStoreConfig.version.version || "0.0.0",
        } as VersionData<BaseData<any>, BaseData<any>>);
      } else {
        versionInfo = createVersionInfo("0.0.0");
      }
      // Create a new SnapshotStore with provided configuration
      snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
        storeId: "",
        name: "",
        version: "",
        schema: {} as Record<string, SchemaField>,
        options: {} as SnapshotStoreOptions<T, K, StructuredMetadata<T, K>, never>,
        category: "",
        config: {} as Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null>,
        expirationDate: new Date(),

        operation: {} as SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        storeProps: {} as Partial<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,

        payload: "",
        callback: "",
        endpointCategory: "",

        initialState: "",

      });
    } else {
      // Fallback to a default or empty instance
      snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
        storeId: storeId,
        name,
        version: version || (snapshotStoreConfig && snapshotStoreConfig.version ? createVersionInfo(snapshotStoreConfig.version) : undefined),
        schema, options, category, config, expirationDate,
        operation, storeProps,
        payload, callback, endpointCategory
      });
    }

    // Create an object that conforms to the Snapshot interface
    const processedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...snapshot,
      id,
      category: category ?? undefined,
      timestamp: new Date(),
      snapshotStore,
      data: snapshotData as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      initialState: snapshotData,
      isCore: false,
      initialConfig: "",
      onInitialize: () => { },
      onError: () => { },
      taskIdToAssign: "",
      schema: {},
      currentCategory: "",
      mappedSnapshotData: new Map(),
      applyStoreConfig: () => { },
      generateId: () => "",
            
      // snapshotData as object
      snapshotData: {
        id: id?.toString() || "",
        data: snapshotData as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: new Date().toISOString(),
        meta: {} as Meta,
        status: "active",
        category: category,
        criteria: undefined,
        enrichedProperties: { 
          processedBy: 'SnapshotConfigBuilder', 
          processingMethod: 'builderPattern',
          builderType: 'SnapshotConfigBuilder<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>',
          builderVersion: '1.0.0',
          processingTimestamp: Date.now(),
          source: 'snapshot-builder.ts',
          configuration: {
            hasKey: !!snapshot.key,
            hasMeta: !!snapshot.meta,
            excludedFieldsCount: snapshot.excluded?.length || 0
          }
        }
      } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

      // setSnapshotData function
      setSnapshotData: (
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        snapshotDataConfig: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        id?: string
      ) => {
        console.log("Setting snapshot data with config:", snapshotDataConfig);
        // Update logic here
      },
      
      // processSnapshotData function - FIXED return type
      processSnapshotData: async (
        id: string | number | null,
        data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: Date,
        payload: UpdateSnapshotPayload<T>,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        payloadData: T | K,
        mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        snapshotId?: string | number | null,
        storeId?: number,
        store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
        console.log("Processing snapshot data", { snapshotId, data });
        return snapshotStore; // Return the correct type
      },
      
      getSnapshotItems: () => [],
      
      setCategory: (category: Category) => {
        if (!category) {
          throw new Error('Category is required to set');
        }
        // Use 'this' or the processedSnapshot reference carefully
        // In an object literal, 'this' might not refer to the object itself
        // Better to use the outer variable or a different approach
        console.log('Category set to:', category);
      }
    }; 

return Promise.resolve(processedSnapshot); // Return the snapshot, not null
  } catch (error) {
    return Promise.resolve(null);
  }
}


const validateSnapshot = (snapshot: Snapshot<BaseData<any>, BaseData>): boolean => {
  return snapshot.id !== undefined && snapshot.data !== undefined;
}





// Create a mock snapshot builder
function createMockSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    // Add all required properties with defaults
    dataObject: {},
    deleted: false,
    initialState: {},
    isCore: false,
    customProperties: undefined,
    initialConfig: {},
    properties: {} as T,
    snapshotsArray: [],
    snapshotsObject: {},
    recentActivity: [],
    onInitialize: () => {},
    onError: null,
    categories: [],
    taskIdToAssign: undefined,
    schema: {},
    currentCategory: 'default' as Category,
    mappedSnapshotData: new Map(),
    storeId: 0,
    shouldArchive: false,
    archivePriority: 'low',
    archiveTags: [],
    archiveRetention: 30,
    archiveImmediately: false,
    versionInfo: null,
    initializedState: {},
    customProperty: undefined,
    criteria: undefined,
    relationships: new Map(),
    storeConfig: undefined,
    additionalData: undefined,
    dataStores: [],
    setCategory: () => {},
    applyStoreConfig: () => {},
    generateId: () => '',
    snapshotData: async () => ({} as any),
    snapshotStoreConfig: null,
    snapshotStoreConfigSearch: null,
    snapshotContainer: null,
    getSnapshotItems: () => [],
    transformSubscriber: (sub) => sub as any,
    defaultSubscribeToSnapshots: () => {},
    getAllSnapshots: async () => [],
    transformDelegate: async () => [],
    getAllKeys: async () => [],
    getAllValues: () => [],
    getAllItems: async () => [],
    getSnapshotEntries: () => new Map(),
    getAllSnapshotEntries: () => [],
    addDataStatus: () => {},
    removeData: () => {},
    updateData: () => {},
    updateDataTitle: () => {},
    updateDataDescription: () => {},
    updateDataStatus: () => {},
    addDataSuccess: () => {},
    getDataVersions: async () => [],
    updateDataVersions: () => {},
    getBackendVersion: async () => '',
    getFrontendVersion: async () => '',
    fetchStoreData: async () => [],
    fetchData: async () => ({} as any),
    defaultSubscribeToSnapshot: () => '',
    handleSubscribeToSnapshot: () => {},
    removeItem: async () => {},
    getSnapshot: async () => ({} as any),
    getSnapshotSuccess: async () => ({} as any),
    setItem: async () => {},
    getItem: async () => ({} as any),
    getDataStore: async () => ({} as any),
    getDataStoreMap: async () => new Map(),
    addSnapshotSuccess: () => {},
    deepCompare: () => false,
    shallowCompare: () => false,
    getDataStoreMethods: () => ({} as any),
    getDelegate: async () => [],
    determineCategory: () => '',
    determinePrefix: () => '',
    removeSnapshot: () => {},
    addSnapshotItem: () => {},
    addNestedStore: () => {},
    clearSnapshots: () => {},
    addSnapshot: async () => ({} as any),
    emit: () => {},
    createSnapshot: () => null,
    createInitSnapshot: async () => ({ success: true, data: {} as any }),
    addStoreConfig: () => {},
    handleSnapshotConfig: () => {},
    getSnapshotConfig: () => [],
    getSnapshotListByCriteria: async () => [],
    setSnapshotSuccess: () => {},
    setSnapshotFailure: () => {},
    updateSnapshots: () => {},
    updateSnapshotsSuccess: () => {},
    updateSnapshotsFailure: () => {},
    initSnapshot: () => {},
    takeSnapshot: async () => ({ snapshot: {} as any }),
    takeSnapshotSuccess: () => {},
    takeSnapshotsSuccess: () => {},
    flatMap: () => [],
    getState: () => ({} as any),
    setState: () => {},
    validateSnapshot: () => false,
    handleActions: () => {},
    setSnapshot: () => {},
    transformSnapshotConfig: (config) => config,
    setSnapshots: () => {},
    clearSnapshot: () => {},
    mergeSnapshots: () => {},
    reduceSnapshots: () => ({} as any),
    sortSnapshots: () => {},
    filterSnapshots: () => {},
    findSnapshot: () => ({} as any),
    mapSnapshots: () => [],
    takeLatestSnapshot: () => ({} as any),
    updateSnapshot: () => ({} as any),
    getSnapshotConfigItems: () => [],
    subscribeToSnapshots: () => [],
    executeSnapshotAction: async () => {},
    getSnapshotItemsSuccess: () => [],
    getSnapshotItemSuccess: () => ({} as any),
    getSnapshotKeys: () => [],
    getSnapshotIdSuccess: () => '',
    getSnapshotValuesSuccess: () => [],
    getSnapshotWithCriteria: () => ({} as any),
    reduceSnapshotItems: () => ({} as any),
    meta: new Map(),  
  } as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

/**
 * Fetches a snapshot by ID with proper typing
 * 
 * @template T - Base data type
 * @template K - Extended data type (defaults to T)
 * @template Meta - Metadata type (defaults to StructuredMetadata<T, K>)
 * @param {string | number | null} snapshotId - ID of the snapshot to fetch
 * @param {number} storeId - ID of the store containing the snapshot
 * @param {Record<string, string>} [additionalHeaders] - Optional additional headers
 * @returns {Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>} - Promise resolving to the snapshot
 */

const getSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  

>(
  snapshotId: string | number | null,
  storeId: number,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Use the appropriate type for T
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotConfig<any>,
  additionalHeaders?: Record<string, string>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  return new Promise((resolve, reject) => {
    if (!snapshotId) {
      reject(new Error('Snapshot ID is required'));
      return;
    }

    // Simulate API call - in real implementation, this would be an actual fetch
    setTimeout(() => {
      // Only mock what you actually use in your test
      // Usage in getSnapshot:
      const mockSnapshot = createMockSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
      mockSnapshot.meta = new Map().set("meta1", {
        getDataStore: async () => ({
          id: "mock-store",
          data: {} as T,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      });
      resolve(mockSnapshot);
    }, 100);
  });
};

/**
 * Gets the latest snapshot from a snapshot provider function
 * 
 * @template T - Base data type
 * @param {(id: string) => Promise<{
 *   category: any;
 *   timestamp: any;
 *   id: any;
 *   snapshot: Snapshot<BaseData<any>, BaseData>;
 *   data: Data<T>;
 * }>} snapshotProvider - Function that provides snapshots by ID
 * @returns {Promise<Snapshot<BaseData<any>, BaseData>>} - Promise resolving to the latest snapshot
 */
const getLatestSnapshot = <T extends BaseDataEntity>(
  snapshotProvider?: (id: string) => Promise<{
    category: any;
    timestamp: any;
    id: any;
    snapshot: EnhancedSnapshotData<BaseData<any>, BaseData>;
    data: Data<T>;
  }>
): Promise<Snapshot<BaseData<any>, BaseData>> => {
  return new Promise((resolve, reject) => {
    if (!snapshotProvider) {
      reject(new Error('Snapshot provider function is required'));
      return;
    }

    // In a real implementation, you might have logic to determine the "latest" ID
    // For this example, we'll simulate getting the latest ID
    const latestId = 'latest_' + Date.now();

    snapshotProvider(latestId)
      .then(result => {
        if (!result || !result.snapshot) {
          throw new Error('Failed to retrieve latest snapshot');
        }
        resolve(result.snapshot);
      })
      .catch(error => {
        console.error('Error fetching latest snapshot:', error);
        reject(error);
      });
  });
};


const takeSnapshot = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // Param 1
  date: Date,                                                                   // Param 2
  projectType: ProjectType,                                                     // Param 3
  projectId: string,                                                            // Param 4
  projectState: ProjectStateEnum,                                               // Param 5
  projectMembers: Member[]                                                      // Param 6
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  
  // Create the snapshot via API or local factory
  const newSnapshot = await snapshotApi.takeSnapshot(
    content,
    date,
    projectType,
    projectId,
    projectState,
    projectMembers
  );
  
  return newSnapshot;
};


const publishSnapshot = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
  
  subscribers.forEach(subscriber => {
    subscriber.update(snapshot);
  });

  return { snapshot };
};

const removeSnapshot = (snapshotToRemove: SnapshotStore<BaseData<any>, BaseData>): void => {
  snapshotToRemove.clearSnapshot();
};

const updateSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotId: string,
  snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  data: Map<string, Snapshot<BaseData<any>, BaseData>>,
  newData: Snapshot<BaseData<any>, BaseData>,
  events?: Record<string, CalendarManagerStoreClass<BaseData<any>, BaseData>[]>,
  snapshotStore?: SnapshotStore<BaseData<any>, BaseData>,
  dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  payload: UpdateSnapshotPayload<Data<T, K, StructuredMetadata<T, K>>>,
  store?: SnapshotStore<any, BaseData>, // Ensure the correct type here
  snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
): Promise<{
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}> => {
  return store.updateSnapshot(
    snapshotId,
    snapshotIdOrParams,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload,
    store
  );
}

const getSnapshots = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  category: string,
  data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return Array.isArray(data) ? data.filter(snapshot => snapshot.category === category) : [];
};

const getSnapshotItems = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  category: Category | undefined,
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<{ snapshots: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> => {
  const snapshotItems: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshots
    .filter(snapshot => snapshot.category === category)
    .map(snapshot => {
      // Ensure content aligns with expected type in SnapshotItem
      const content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined =
        typeof snapshot.content === 'string'
          ? undefined // Or handle string content conversion if needed
          : snapshot.content;
      return {
        ...snapshot,
        content, // Now either undefined or Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      } as SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    });

  return { snapshots: snapshotItems };
};

const getSnapshotContainer = <T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  id: string | number,
  snapshotFetcher: (id: string | number) => Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    data: Data<T>;
    newData: Data<T>;
    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    createSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    getSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
    // New Methods
    mapSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
    mapSnapshotWithDetails: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
    removeStore: (id: string) => void;
    fetchSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    fetchSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    updateSnapshotFailure: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, error: Error) => void;
    fetchSnapshotFailure: (id: string, error: Error) => void;
    configureSnapshotStore: (options: any) => void;
    onSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    getSnapshotStore: (storeId: number,
      snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      criteria: CriteriaType
    ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    events: any[];
    parentId: string;
    childIds?: K[];
    getParentId: () => string;
    getChildIds: () => string[];
    addChild: (id: string) => void;
    removeChild: (id: string) => void;
    getChildren: () => string[];
    hasChildren: (id: string) => boolean;
    isDescendantOf: (id: string) => boolean;
    getSnapshotById: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
    mappedSnapshotData: any;
    snapshotData: any;
    currentCategory: string;
    setSnapshotCategory: (category: string) => void;
    getSnapshotCategory: () => string;
    config: any;
    getSnapshotData: () => Data<T>;
    isCore: boolean;
    notify: () => void;
    notifySubscribers: () => void;
    getSnapshots: () => Snapshots<BaseData<any>, K>;
    getAllSnapshots: () => Snapshots<BaseData<any>, K>;
    generateId: () => string;
    compareSnapshots: (snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number;
    compareSnapshotItems: (item1: any, item2: any) => number;
    filterSnapshotsByCategory: (category: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    filterSnapshotsByTag: (tag: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    handleSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    getSnapshotId: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string;
    compareSnapshotState: (state1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
    payload: any;
    dataItems: any[];
    getInitialState: () => any;
    getConfigOption: (option: string) => any;
    getTimestamp: () => string;
    getStores: () => any[];
    getData: () => Data<T>;
    setData: (data: Data<T>) => void;
    addData: (data: Data<T>) => void;
    stores: any[];
    getStore: (id: string) => any | undefined;
    addStore: (storId: number) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }>
): Promise<{
  category: string;
  timestamp: string;
  id: string;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  data: Data<T>;
  newData: Data<T>;

  unsubscribe: () => void;
  addSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  createSnapshotFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
  updateSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
  batchUpdateSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  createSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  batchTakeSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  batchTakeSnapshotsRequest: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  deleteSnapshot: (id: string) => void;
  batchFetchSnapshots: (criteria: any) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
  filterSnapshotsByStatus: (status: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  getSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  removeSnapshot: (id: string) => void;
  removeSnapshots: (ids: string[]) => void;
  removeSnapshotsSuccess: (ids: string[]) => void;
  removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error }) => void;
  resetSnapshotData: () => void;
  // New Methods
  mapSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
  mapSnapshotWithDetails: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any;
  removeStore: (id: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  fetchSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateSnapshotFailure: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, error: Error) => void;
  fetchSnapshotFailure: (id: string, error: Error) => void;
  configureSnapshotStore: (options: any) => void;
  onSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  events: any[];
  parentId: string;
  childIds?: K[];
  getParentId: () => string;
  getChildIds: () => string[];
  addChild: (id: string) => void;
  removeChild: (id: string) => void;
  getChildren: () => string[];
  hasChildren: (id: string) => boolean;
  isDescendantOf: (id: string) => boolean;
  getSnapshotById: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  mappedSnapshotData: any;
  snapshotData: any;
  currentCategory: string;
  setSnapshotCategory: (category: string) => void;
  getSnapshotCategory: () => string;
  config: any;
  getSnapshotData: () => Data<T>;
  isCore: boolean;
  notify: () => void;
  notifySubscribers: () => void;
  getSnapshots: () => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  getAllSnapshots: () => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  generateId: () => string;
  compareSnapshots: (snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number;
  compareSnapshotItems: (item1: any, item2: any) => number;
  filterSnapshotsByCategory: (category: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  filterSnapshotsByTag: (tag: string) => Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  handleSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  getSnapshotId: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string;
  compareSnapshotState: (state1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  payload: any;
  dataItems: any[];
  getInitialState: () => any;
  getConfigOption: (option: string) => any;
  getTimestamp: () => string;
  getStores: () => any[];
  getData: () => Data<T>;
  setData: (data: Data<T>) => void;
  addData: (data: Data<T>) => void;
  stores: any[];
  getStore: (id: string) => any | undefined;
  addStore: (storeId: number) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}> => {
  // Your implementation here
  return snapshotFetcher(id).then(snapshotContainer => {
    return {

      // Snapshot Management
      mapSnapshot: snapshotContainer.mapSnapshot,
      mapSnapshotWithDetails: snapshotContainer.mapSnapshotWithDetails,
      fetchSnapshot: snapshotContainer.fetchSnapshot,
      fetchSnapshotSuccess: snapshotContainer.fetchSnapshotSuccess,
      updateSnapshotFailure: snapshotContainer.updateSnapshotFailure,
      fetchSnapshotFailure: snapshotContainer.fetchSnapshotFailure,
      configureSnapshotStore: snapshotContainer.configureSnapshotStore,
      createSnapshotSuccess: snapshotContainer.createSnapshotSuccess,
      createSnapshotFailure: snapshotContainer.createSnapshotFailure,
      updateSnapshotSuccess: snapshotContainer.updateSnapshotSuccess,
      batchUpdateSnapshotsSuccess: snapshotContainer.batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure: snapshotContainer.batchUpdateSnapshotsFailure,
      batchUpdateSnapshotsRequest: snapshotContainer.batchUpdateSnapshotsRequest,
      createSnapshots: snapshotContainer.createSnapshots,
      batchTakeSnapshot: snapshotContainer.batchTakeSnapshot,
      batchTakeSnapshotsRequest: snapshotContainer.batchTakeSnapshotsRequest,
      deleteSnapshot: snapshotContainer.deleteSnapshot,
      batchFetchSnapshots: snapshotContainer.batchFetchSnapshots,
      batchFetchSnapshotsSuccess: snapshotContainer.batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure: snapshotContainer.batchFetchSnapshotsFailure,
      removeSnapshot: snapshotContainer.removeSnapshot,
      removeSnapshots: snapshotContainer.removeSnapshots,
      removeSnapshotsSuccess: snapshotContainer.removeSnapshotsSuccess,
      removeSnapshotsFailure: snapshotContainer.removeSnapshotsFailure,
      resetSnapshotData: snapshotContainer.resetSnapshotData,
      getSnapshotSuccess: snapshotContainer.getSnapshotSuccess,
      addSnapshotFailure: snapshotContainer.addSnapshotFailure,
      getSnapshotId: snapshotContainer.getSnapshotId,
      getSnapshotById: snapshotContainer.getSnapshotById,
      getSnapshots: snapshotContainer.getSnapshots,
      getAllSnapshots: snapshotContainer.getAllSnapshots,
      generateId: snapshotContainer.generateId,
      handleSnapshotSuccess: snapshotContainer.handleSnapshotSuccess,

      // Snapshot Filtering and Comparison
      compareSnapshots: snapshotContainer.compareSnapshots,
      compareSnapshotItems: snapshotContainer.compareSnapshotItems,
      filterSnapshotsByCategory: snapshotContainer.filterSnapshotsByCategory,
      filterSnapshotsByTag: snapshotContainer.filterSnapshotsByTag,
      filterSnapshotsByStatus: snapshotContainer.filterSnapshotsByStatus,
      compareSnapshotState: snapshotContainer.compareSnapshotState,

      // Data Management
      getData: snapshotContainer.getData,
      setData: snapshotContainer.setData,
      addData: snapshotContainer.addData,
      getSnapshotData: snapshotContainer.getSnapshotData,
      payload: snapshotContainer.payload,
      dataItems: snapshotContainer.dataItems,
      getInitialState: snapshotContainer.getInitialState,
      getConfigOption: snapshotContainer.getConfigOption,
      getTimestamp: snapshotContainer.getTimestamp,


      // Store Management
      getStores: snapshotContainer.getStores,
      getStore: snapshotContainer.getStore,
      addStore: snapshotContainer.addStore,
      removeStore: snapshotContainer.removeStore,
      stores: snapshotContainer.stores,


      //  Snapshot Container Info
      id: snapshotContainer.id,
      category: snapshotContainer.category,
      snapshotStore: snapshotContainer.snapshotStore,
      data: snapshotContainer.data,
      newData: snapshotContainer.newData,
      snapshot: snapshotContainer.snapshot,
      snapshots: snapshotContainer.snapshots,
      timestamp: snapshotContainer.timestamp,
      subscribers: snapshotContainer.subscribers,
      unsubscribe: snapshotContainer.unsubscribe,
      events: snapshotContainer.events,
      parentId: snapshotContainer.parentId,
      childIds: snapshotContainer.childIds,
      getParentId: snapshotContainer.getParentId,
      getChildIds: snapshotContainer.getChildIds,
      addChild: snapshotContainer.addChild,
      removeChild: snapshotContainer.removeChild,
      getChildren: snapshotContainer.getChildren,
      hasChildren: snapshotContainer.hasChildren,
      isDescendantOf: snapshotContainer.isDescendantOf,
      mappedSnapshotData: snapshotContainer.mappedSnapshotData,
      snapshotData: snapshotContainer.snapshotData,
      currentCategory: snapshotContainer.currentCategory,
      setSnapshotCategory: snapshotContainer.setSnapshotCategory,
      getSnapshotCategory: snapshotContainer.getSnapshotCategory,
      config: snapshotContainer.config,
      isCore: snapshotContainer.isCore,
      notify: snapshotContainer.notify,
      notifySubscribers: snapshotContainer.notifySubscribers,
      onSnapshot: snapshotContainer.onSnapshot,
      onSnapshots: snapshotContainer.onSnapshots,
      getSnapshotStore: snapshotContainer.getSnapshotStore,
    };
  }).catch(error => {
    console.error("Error fetching snapshot container:", error);
    throw error; // Optionally handle or rethrow the error
  });
};

const configureSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  id: string,
  category?: Category,
  callback?: ((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void),
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
  if (!id || !snapshot) {
    console.error("Invalid ID or snapshot");
    return null;
  }

  // category assignment
  if (category) {
    (snapshot as any).category =
      typeof category === "string" ? category : (category as any).name;
  }

  // add snapshot to store
  if (snapshotStore && snapshotStoreConfig) {
    try {
      if (typeof (snapshotStore as any).addSnapshot === "function") {
        (snapshotStore as any).addSnapshot(snapshot, id, subscribers);
      } else {
        console.warn("SnapshotStore has no addSnapshot method.");
      }
    } catch (error) {
      console.error("Failed to add snapshot to store:", error);
      return null;
    }
  }

  // callback
  if (callback) {
    try {
      callback(snapshot);
    } catch (error) {
      console.error("Callback execution failed:", error);
    }
  }

  return snapshot;
};


export {
  clearSnapshotFailure, configureSnapshot, createMockSnapshot, getChildIds, getLatestSnapshot, getParentId, getSnapshot, getSnapshotById,
  getSnapshotContainer, getSnapshotItems, getSnapshots, handleSnapshot, mapSnapshots, removeSnapshot,
  takeSnapshot, updateSnapshot, validateSnapshot
};
export type { SnapshotOperations };

