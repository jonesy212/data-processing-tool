// snapshotContainerInstance.ts
import { Shared } from '@/core/api/instances/createSharedSnapshotContainer';
import { default as getSnapshot, default as snapshotContainer } from '@/core/api/SnapshotApi';
import { SnapshotWithData } from '@/core/components/calendar/CalendarApp';
import { AppStructureItem } from '@/core/config/appStructure/AppStructure';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta, SharedConfig } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotManager } from '@/core/hooks/useSnapshotManager';
import { CreateSnapshotsPayload } from '@/core/interfaces/payload/payloadTypes';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { Data, DataDetails } from '@/core/models/data/Data';
import { K, T } from '@/core/models/data/dataStoreMethods';
import { Tag } from '@/core/models/tracker/Tag';
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/core/pages/searches/CriteriaType';
import type { DataStoreMethods } from '@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { CoreSnapshot } from "@/core/snapshots/CoreSnapshot";
import { FetchSnapshotPayload } from '@/core/snapshots/FetchSnapshotPayload';
import { Snapshots, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { ConfigureSnapshotStorePayload, SnapshotConfig } from '@/core/snapshots/SnapshotConfig';
import { SnapshotContainer, SnapshotContainerData, SnapshotDataType } from '@/core/snapshots/SnapshotContainer';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotStoreProps, storeProps } from '@/core/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import type { DataStore } from '@/core/state/stores/DataStore';
import { Subscriber } from '@/core/subscribers/Subscriber';
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { Callback } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { Subscription } from '@/core/subscriptions/Subscription';
import {
    SnapshotAttachment,
    SnapshotEntity,
    SnapshotExcludedFields,
    SnapshotIncludedFields,
    SnapshotK,
    SnapshotMeta
} from '@/core/typings/entities/SnapshotEntity';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import { SnapshotEvent } from '@/core/typings/snapshotTypes';
import { Version } from '@/core/versions/Version';


function createSnapshotContainerConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotConfig: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  sharedConfig: Partial<SharedConfig> = {}
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & SharedConfig> {
  
  const defaultSnapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    storeId: "default-store-id",
    name: "Default Snapshot Store",
    category: "default",
    endpointCategory: "default",
    expirationDate: new Date(),
    criteria: {},
    schema: {},
    options: {} as any,
    callback: () => {},
    // Add other required properties with defaults
  };

  const defaultSharedConfig: SharedConfig = {
    apiKey: "",
    apiEndpoint: "",
    // Add other shared properties
  };

  const fullConfig = {
    ...defaultSnapshotConfig,
    ...defaultSharedConfig,
    ...snapshotConfig,
    ...sharedConfig,
  };

  return Promise.resolve(fullConfig as any);
}

const snapshotContainerInstance: SnapshotContainer<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> & Shared = {
  childIds: undefined,
  // ...other properties and methods
  snapshotContainer: snapshotContainer,
  getSnapshot: getSnapshot,
  name: undefined,
  mappedSnapshotData: undefined,
  criteria: undefined,
  snapshotCategory: undefined,
  snapshotSubscriberId: undefined,
  initialConfig: null,
  removeSubscriber: undefined,
  data: undefined,
  currentCategory: undefined,
  onError: function (error: any): void {
    throw new Error('Function not implemented.');
    },
  onInitialize: function (): void {
    throw new Error('Function not implemented.');
  },

  snapshot: function (
    id: string | number | undefined,
    snapshotData: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void,
    dataStore: DataStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    dataStoreMethods: DataStoreMethods<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    metadata: UnifiedMetadata<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshotConfigData: SnapshotConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    subscription: Subscription<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    category?: Category,    
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | undefined,
    snapshotContainer?: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
      | Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null): Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    | Promise<{
        snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      }> {
    throw new Error('Function not implemented.');
  },
  snapshotStore: null,
  snapshotData: function (
    id: string | number | undefined,
    data: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    mappedSnapshotData: Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> | null | undefined,
    snapshotData: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    categoryProperties: CategoryProperties | undefined, 
    dataStoreMethods: DataStoreMethods<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    storeProps: SnapshotStoreProps<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    category?: Category,
    snapshotId?: string | number | null,
    storeId?: number
  ): Promise<SnapshotDataType<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> {
    throw new Error('Function not implemented.');
  },
  id: undefined,
  items: {} as Record<string, AppStructureItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> & SharedConfig>, 
  config: createSnapshotContainerConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>({
    storeId: "my-snapshot-store",
    name: "My Snapshot Container",
    apiKey: '',
    apiEndpoint: ''
  }, {
    apiKey: "secret-key-123",
    apiEndpoint: "https://api.mydomain.com/v1",
  }),
  timestamp: undefined,
  find: function (id: string) {
    throw new Error('Function not implemented.');
  },
  setSnapshotCategory: function (id: string, newCategory: string | Category): void {
    throw new Error('Function not implemented.');
  },
  getSnapshotCategory: function (id: string): Category | undefined {
    throw new Error('Function not implemented.');
  },
  storeId: 0,
  isExpired: function (): boolean | undefined {
    throw new Error('Function not implemented.');
  },
  subscribers: [],
  getSnapshotData: function (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    categoryProperties: CategoryProperties | undefined, 
    dataStoreMethods: DataStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    category?: Category,
  ): Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> | null | undefined {
      throw new Error('Function not implemented.');
    },
  deleteSnapshot: function (id: string): void {
    throw new Error('Function not implemented.');
  },
  isCore: false,
  snapConfig: undefined,
  getSnapshots: function (
    category: string,
    data: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error('Function not implemented.');
  },
  
  getAllSnapshots: function (
    storeId: number,
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    ctx: SnapshotContext<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      data: T;
      snapshotId?: string;
      snapshotData?: T;
      snapshotStore?: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      category?: Category;
    },
    filter?: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => Promise<SnapshotUnion<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>

  ): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]> {
    throw new Error('Function not implemented.');
  },
  generateId: function (prefix: string, name: string, type: NotificationType, id?: string, title?: string, chatThreadName?: string, chatMessageId?: string, chatThreadId?: string, dataDetails?: DataDetails, generatorType?: string): string {
    throw new Error('Function not implemented.');
  },
  compareSnapshots: function (
    snap1: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snap2: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): {
      snapshot1: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      snapshot2: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      differences: Record<string, { snapshot1: any; snapshot2: any; }>;
      versionHistory: {
        snapshot1Version?: number | Version<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
        snapshot2Version?: number | Version<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
      };
      } | null {
    throw new Error('Function not implemented.');
  },
  compareSnapshotItems: function (
    snap1: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snap2: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    keys: (keyof Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>)[]): { itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: { [key: string]: { value1: any; value2: any; }; }; }>; } | null {
    throw new Error('Function not implemented.');
  },
  batchTakeSnapshot: function (
    id: number,
    snapshotId: string,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): Promise<{ snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>; }> {
    throw new Error('Function not implemented.');
  },
  batchFetchSnapshots: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => Promise<{
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
    }>): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]> {
    throw new Error('Function not implemented.');
  },
  batchTakeSnapshotsRequest: function (
    criteria: CriteriaType,
    snapshotData: (snapshotIds: string[],
      snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
    ) => Promise<{
  subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
    }>): Promise<void> {
    throw new Error('Function not implemented.');
  },
  batchUpdateSnapshotsRequest: function (
    snapshotData: (
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>; snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
    }>,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): Promise<void> {
    throw new Error('Function not implemented.');
  },
  filterSnapshotsByStatus: function (status: string) {
    throw new Error('Function not implemented.');
  },
  filterSnapshotsByCategory: function (
    category: Category
  ): Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> {
    throw new Error('Function not implemented.');
  },

  filterSnapshotsByTag: function (
    tag: Tag<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ) {
    throw new Error('Function not implemented.');
  },
  batchFetchSnapshotsSuccess: function (
    subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): void {
    throw new Error('Function not implemented.');
  },
  batchFetchSnapshotsFailure: function (date: Date, snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, payload: { error: Error; }): void {
    throw new Error('Function not implemented.');
  },
  batchUpdateSnapshotsSuccess: function (
    subscribers: SubscriberCollection<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): void {
    throw new Error('Function not implemented.');
  },
  batchUpdateSnapshotsFailure: function (date: Date, snapshotId: string | number | null, snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, payload: { error: Error; }): void {
    throw new Error('Function not implemented.');
  },
  handleSnapshotSuccess: function (message: string, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null, snapshotId: string): void {
    throw new Error('Function not implemented.');
  },
  handleSnapshotFailure: function (error: Error, snapshotId: string): void {
    throw new Error('Function not implemented.');
  },
  getSnapshotId: function (
    key: string | SnapshotEntity,
    snapshot: SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): string {
    throw new Error('Function not implemented.');
  },
  compareSnapshotState: function (
    snapshot1: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null,
    snapshot2: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ): boolean {
  throw new Error('Function not implemented.');
  },
  payload: undefined,
  dataItems: function (): RealtimeDataItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] | null {
    throw new Error('Function not implemented.');
  },
  newData: null,
  getInitialState: function (): Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null {
    throw new Error('Function not implemented.');
  },
  getConfigOption: function (optionKey: string) {
    throw new Error('Function not implemented.');
  },
  getTimestamp: function (): Date | undefined {
    throw new Error('Function not implemented.');
  },
  getStores: function (storeId: number, snapshotId: string, snapshotStores: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], snapshotStoreConfigs: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]): SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] {
    throw new Error('Function not implemented.');
  },
  getData: function (id: number | string, snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): Data<T> | Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> | null | undefined {
    throw new Error('Function not implemented.');
  },
  getDataVersions: function (id: number): Promise<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] | undefined> {
    throw new Error('Function not implemented.');
  },
  updateDataVersions: function (id: number, versions: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]): void {
    throw new Error('Function not implemented.');
  },
  setData: function (id: string, data: Map<string, Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>): void {
    throw new Error('Function not implemented.');
  },
  addData: function (id: string, data: Partial<Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>): void {
    throw new Error('Function not implemented.');
  },
  removeData: function (id: number): void {
    throw new Error('Function not implemented.');
  },
  updateData: function (id: number, newData: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error('Function not implemented.');
  },
  stores: function (): SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] {
    throw new Error('Function not implemented.');
  },
  getStore: function (storeId: number, snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshotId: string | null, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshotStoreConfig: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, type: string, event: Event) {
    throw new Error('Function not implemented.');
  },
  addStore: function (storeId: number, snapshotId: string, snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, type: string, event: Event) {
    throw new Error('Function not implemented.');
  },
  mapSnapshot: function (id: number, storeId: string | number, snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshotContainer: SnapshotContainer<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshotId: string, criteria: CriteriaType, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, type: string, event: Event, callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void, mapFn: (item: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): Snapshot<SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotSnapshotIncludedFields<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>,
          SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>> | null {
    throw new Error('Function not implemented.');
  },
  mapSnapshotWithDetails: function (
    storeId: number,
    snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshotId: string,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    type: string,
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
  ): SnapshotWithData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null {
    throw new Error('Function not implemented.');
  },
  removeStore: function (storeId: number, store: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, snapshotId: string, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, type: string, event: Event): void {
    throw new Error('Function not implemented.');
  },
  unsubscribe: function (
    unsubscribeDetails: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; unsubscribeReason: string; unsubscribeData: any; },
    callback: Callback<Snapshot<SnapshotContainerData<T, K,
      ExcludedFields<T, keyof T>>,
      SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>> | null
  ): void {
    throw new Error('Function not implemented.');
  },
  fetchSnapshot: function (
    snapshotId: string, 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | undefined,
      snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      payloadData: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | Data, 
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      delegate: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]
    ) => Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
      | Promise<{
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> }>,
    category?: Category,

  ): Promise<{
          id: string;
          category: Category | string | symbol | undefined;
          categoryProperties: CategoryProperties | undefined;
          timestamp: Date;
          snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
          data: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
          delegate: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[];
        }>
  {
    throw new Error('Function not implemented.');
  },
  fetchSnapshotSuccess: function (
    id: number,
    snapshotId: string,
    snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: FetchSnapshotPayload<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | undefined,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    data: SnapshotContainerData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    delegate: SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
      subscribers: Subscriber<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
      snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void
  ): SnapshotWithCriteria<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] {
    throw new Error('Function not implemented.');
  },
  updateSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    date: Date | undefined,
    payload: { error: Error; }): void {
    throw new Error('Function not implemented.');
  },
  fetchSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    date: Date | undefined, payload: { error: Error; }
  ): void {
    throw new Error('Function not implemented.');
  },
  addSnapshotFailure: function (
    date: Date,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: { error: Error; }
  ): void {
    throw new Error('Function not implemented.');
  },
  configureSnapshotStore: function (snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    events: Record<string, CalendarManagerStoreClass<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>,
    dataItems: RealtimeDataItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[], newData: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: ConfigureSnapshotStorePayload<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    store: SnapshotStore<any, K>, callback: (snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void, config: SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>
  ) : void {
    throw new Error('Function not implemented.');
  },
  updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload?: { data?: Error; }): void {
    throw new Error('Function not implemented.');
  },
  createSnapshotFailure: function (date: Date,
    snapshotId: string,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: { error: Error; }): void {
    throw new Error('Function not implemented.');
  },
  createSnapshotSuccess: function (
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload?: { data?: any; }): void {
    throw new Error('Function not implemented.');
  },
  createSnapshots: function (
    id: string,
    snapshotId: string | number | null,
    snapshots: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[],
    snapshotManager: SnapshotManager<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    payload: CreateSnapshotsPayload<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    callback: (snapshots: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]) => void | null,
    snapshotDataConfig?: SnapshotConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] | undefined,
    category?: string | Category,
     categoryProperties?: CategoryProperties): Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] | null {
    throw new Error('Function not implemented.');
  },
  onSnapshot: function (
    snapshotId: string,
    snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    type: string,
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    callback: (snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void): void {
    throw new Error('Function not implemented.');
  },
  onSnapshots: function (
    snapshotId: string,
    snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, 
    type: string, 
    event: SnapshotEvent<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, callback: (snapshots: Snapshots<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>) => void): Snapshotvoid<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> {
    throw new Error('Function not implemented.');
  },
  events: undefined,
  childIds: undefined,
  getParentId: function (id: string, snapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): string | null {
    throw new Error('Function not implemented.');
  },
  getChildIds: function (id: string, childSnapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): (string | number | undefined)[] {
    throw new Error('Function not implemented.');
  },
  addChild: function (parentId: string, childId: string, childSnapshot: CoreSnapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error('Function not implemented.');
  },
  removeChild: function (childId: string, parentId: string, parentSnapshot: CoreSnapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>, childSnapshot: CoreSnapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): void {
    throw new Error('Function not implemented.');
  },
  getChildren: function (
    id: string, 
    childSnapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): CoreSnapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] {
    throw new Error('Function not implemented.');
  },
  hasChildren: function (id: string): boolean {
    throw new Error('Function not implemented.');
  },
  isDescendantOf: function (
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
    childSnapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>): boolean {
    throw new Error('Function not implemented.');
  },
  getSnapshotById: function (id: string): Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null {
    throw new Error('Function not implemented.');
  },
  initialState: undefined
};



const { snapshotId, storeId, additionalHeaders } = storeProps

// Retrieve the snapshot
const snapshot = snapshotContainerInstance.getSnapshot({
  snapshotId,
  storeId,
  additionalHeaders,
});

if (snapshot) {
  console.log("Retrieved snapshot:", snapshot);
} else {
  console.log("No snapshot available.");
}