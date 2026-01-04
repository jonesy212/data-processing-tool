// SnapshotConfigBuilder.ts

import { ExcludedFields } from "@/core/components/routing/Fields";
import type { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { EventStore } from "@/core/events/EventStore";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { SnapshotManager } from "@/core/hooks/useSnapshotManager";
import type { Data } from '@/core/models/data/Data';
import type { StoreMethods } from "@/core/models/tasks/StoreMethods";
import { criteria } from "@/core/pages/searches/FilterCriteria";
import baseMeta from "@/core/server/database/baseMeta";
import { generateId } from "@/core/snapshots/InitializedStateExample";
import type { SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import type { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { InitializedData, SnapshotInstanceProps } from "@/core/snapshots/SnapshotStoreOptions";
import { storeProps } from "@/core/snapshots/SnapshotStoreProps";
import type { SnapshotSubscriberManagement } from "@/core/snapshots/SnapshotSubscriberManagement";
import type { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { initialState } from "@/core/state/redux/slices/FilteredEventsSlice";
import type { SnapshotMeta } from "@/core/typings/entities/SnapshotEntity";
import type { SnapshotEvents } from '@/core/typings/snapshotTypes';

import type { EventHandlers } from '@/core/libraries/eventSystem/eventHandlers';

interface SnapshotLifecycle<T extends BaseDataEntity = BaseDataRoot> {
  initializeWithData<T>(data: SnapshotUnion<T, any, any, any, any, any>[]): void;
  clear(): void;
}

type SnapshotConfigParams<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  Extras extends unknown[] = [] // Allow flexible extension
> = [T, K, Meta, AttachmentType, ExcludedFields, IncludedFields, ...Extras];


// ✅ Simulated Data Source that expands from params tuple
interface SimulatedDataSourceFromParams<
  Params extends SnapshotConfigParams<any, any, any, any, any, any, any[]> = SnapshotConfigParams
> extends SnapshotInstanceProps<
    Params[0], // T
    Params[1], // K
    Params[2], // Meta
    Params[3], // AttachmentType
    Params[4], // ExcludedFields
    Params[5]  // IncludedFields
  > {
  data: Data<
    Params[0],
    Params[1],
    Params[2],
    Params[3],
    Params[4],
    Params[5]
  >;
  fetchData: () => Promise<
    SnapshotStoreConfig<
      Params[0],
      Params[1],
      Params[2],
      Params[3],
      Params[4],
      Params[5]
    >
  >;
}

// Master builder (factory companion)
export interface SnapshotConfigBuilder<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  createConfig?: (
    params: SnapshotConfigParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  getType(): T;
  getKey(): K;
  getMeta(): Meta;
  getExcluded(): ExcludedFields[];
  getIncluded(): IncludedFields[];
//   build(): any; 
  // Core
  buildBaseConfig(): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildStoreMethods(): Promise<StoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildEventHandlers(): Promise<EventHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildSnapshotStore(): Promise<EventStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildSnapshotUnion(data: T, related?: K[]): Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildLifecycle(): Promise<SnapshotLifecycle<T>>;
  buildMeta(): Promise<SnapshotMeta>;

  // Extended
  buildStoreConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildSnapshotEvents(): Promise<SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildContainer(): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildSubscribers(): Promise<SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildWithCriteria(): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  buildManager(): Promise<SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}


export type { SnapshotConfigParams, SnapshotLifecycle };


// Initialize builder
const builder: SnapshotConfigBuilder<SnapshotConfigParams> = {
  buildBaseConfig: async (params) => ({

    deleted: false,
    initialConfig: '',
    onInitialize: '',
    taskIdToAssign: '',
  
    latestVersion: '',
    schema: '',
    currentCategory: '',
    mappedSnapshotData: '',
  
    storeId: '',
    versionInfo: '',
    initializedState: '',
    snapshotContainer: '',
    config: '',
  

    id: generateId?.('prefix', 'name', NotificationTypeEnum.Default) || 'default-id',
    description: 'Snapshot description',
    category: currentCategory,
    metadata: unifiedMetadata, // Optional
    meta: structuredMetadata, // Optional
    mappedSnapshot: new Map(),
    mappedMeta: new Map(),
    snapshotCriteria: undefined,
    criteria: criteria || 'default-criteria',
    priority: priority || 'normal',
    data: baseData as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: [],
    storeConfig: snapshotStoreConfig,
    initialState: initialState || {},
    isCore: true,
    additionalData: additionalData,
    hasSnapshots: async () => false, // Provide a default implementation

    // If you need, include baseData / baseMeta props as well
    baseData,
    baseMeta,
    props: storeProps!,
  }),
  buildStoreMethods: async () => ({} as any),
  buildEventHandlers: async () => ({} as any),
  buildSnapshotStore: async () => ({} as any),
  buildSnapshotUnion: async () => ({} as any),
  buildLifecycle: async () => ({} as any),
  buildMeta: async () => ({} as any),
  buildStoreConfig: async () => ({} as any),
  buildSnapshotEvents: async () => ({} as any),
  buildContainer: async () => ({} as any),
  buildSubscribers: async () => ({} as any),
  buildWithCriteria: async () => ({} as any),
  buildManager: async () => ({} as any),
};

const { data: baseSnapshot } = await builder.buildBaseConfig();
