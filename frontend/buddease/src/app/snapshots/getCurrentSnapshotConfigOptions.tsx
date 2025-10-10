// getCurrentSnapshotConfigOptions.ts

import { CategoryProperties } from "@/app/app/pages/personas/ScenarioBuilder";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { createSnapshotStoreConfig } from '@/app/snapshots/snapshotStoreConfigInstance';
import { InitializedDelegate } from '@/app/snapshots/SnapshotStoreOptions';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscription } from '@/app/subscriptions/Subscription';
import { DataWithPriority, DataWithTimestamp, DataWithVersion } from "@/app/utils/versionUtils";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

import {
    ConfigureSnapshotStorePayload,
    Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData,
    SnapshotStoreProps,
    SnapshotWithCriteria
} from '@/index';


class InitializedDelegateClass<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> implements InitializedDelegate<T, K, Meta> {
  private delegates: SnapshotWithCriteria<T, K, Meta>[];

  constructor(delegates: SnapshotWithCriteria<T, K, Meta>[]) {
    this.delegates = delegates;
  }

  public toConfigArray(): SnapshotStoreConfig<T, K, Meta>[] {
    return this.delegates.map((snap) => ({
      snapshotId: snap.id,
      snapshotContainer: snap.snapshots ?? [],
      criteria: snap.criteria,
      category: snap.category,
      categoryProperties: snap.categoryProperties,
      delegate: null,
      snapshotData: (store) => ({ snapshots: snap.snapshots ?? [] }),
      createdAt: snap.timestamp ? new Date(snap.timestamp) : new Date(),
      updatedAt: new Date(),
      metadata: snap.meta,
      snapshots: snap.snapshots ?? [],
      subscribers: snap.subscribers ?? [],
    }));
  }
  public async toConfigArrayAsync(): Promise<SnapshotStoreConfig<T, K, Meta>[]> {
    return this.toConfigArray();
  }
}


export const getCurrentSnapshotConfigOptions = <
  T extends BaseDataEntity, 
  K extends T = T,
 Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
  id: string | number,
  snapshotId: string | null,
  criteria: CriteriaType,
  category?: Category,  
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: SnapshotWithCriteria<T, K, Meta>[] | null,
  snapshotData: SnapshotData<T, K, Meta>,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Added prop
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Added prop
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, // Added prop
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  endpointCategory: string | number,
  snapshotContainer: Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

  if (!snapshotId) {
    throw new Error('Snapshot ID is required');
  }

  const delegateInstance: InitializedDelegate<T, K, Meta> | null = delegate
    ? new InitializedDelegateClass<T, K, Meta>(delegate)
    : null;

  // Use createSnapshotStoreConfig to initialize the base configuration
  const baseConfig = createSnapshotStoreConfig<T, K, Meta>({
    snapshotId,
    getSnapshotContainer: () => snapshotContainer, // wrap your promise
    criteria,
    category,
    categoryProperties,
    delegate: delegateInstance,
    snapshotData: (snapshotStore: SnapshotStore<T, K, Meta>) => {
      const snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
      if (snapshotData && Array.isArray(snapshotData)) {
        snapshotsArray.push(...snapshotData);
      }
      return { snapshots: snapshotsArray };
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {} as Meta,
    snapshots: [],      // Correct type: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    subscribers: [],    // Correct type: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]  
  });

  // Type guards for conditional properties in the configuration
  const isDataWithPriority = (data: any): data is Partial<DataWithPriority> => 
    data && typeof data === 'object' && 'priority' in data;

  const isDataWithVersion = (data: any): data is Partial<DataWithVersion> => 
    data && typeof data === 'object' && 'version' in data;

  const isDataWithTimestamp = (data: any): data is Partial<DataWithTimestamp> => 
    data && typeof data === 'object' && 'timestamp' in data;

  // Conditional logic for configuring based on data properties
  if (isDataWithPriority(snapshotData)) {
    console.log(`Priority level: ${snapshotData.priority}`);
    // Extend baseConfig if needed based on priority
  }

  if (isDataWithVersion(snapshotData)) {
    console.log(`Version: ${snapshotData.version}`);
    // Extend baseConfig if needed based on version
  }

  if (isDataWithTimestamp(snapshotData)) {
    console.log(`Timestamp: ${snapshotData.timestamp}`);
    // Extend baseConfig if needed based on timestamp
  }

  // Return the final configuration, integrating configureSnapshot method and ensuring tempData is accessible
  return {
    ...baseConfig,
    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties?: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): { snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, config: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } | null => {
      // Ensure snapshotStore exists within snapshotData
      if (!snapshotData.snapshotStore) {
        throw new Error("snapshotStore cannot be null");
      }

      // Link baseConfig to snapshotStore
      snapshotData.snapshotStore.snapshotStoreConfig = baseConfig;

      // Return configured snapshot and config
      return snapshotData.snapshotStore;
    },
    // Ensure tempData access is part of the configuration
    tempData: baseConfig.tempData
  };
};
