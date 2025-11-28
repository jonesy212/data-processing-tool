// SnapshotConfigBuilder.ts

import { EventStore } from "@/app/events/EventStore";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import baseMeta from "@/app/server/database/baseMeta";
import { ExcludedFields } from "../components/routing/Fields";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { Attachment } from "../documents/attachment/Attachment";
import { K, Meta, T } from "../models/data/dataStoreMethods";
import { StoreMethods } from "../models/tasks/StoreMethods";
import { criteria } from "../pages/searches/FilterCriteria";
import { initialState } from "../state/redux/slices/FilteredEventsSlice";
import { SnapshotMeta } from "../typings/entities/SnapshotEntity";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotEvents } from '@/app/typings/eventTypes;
import { generateId } from "./SnapshotIdentity";
import { InitializedData, SnapshotInstanceProps } from "./SnapshotStoreOptions";
import { storeProps } from "./SnapshotStoreProps";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";


interface SnapshotLifecycle<T extends BaseDataEntity> {
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
  getExcluded(): IncludedFields[];
//   build(): any; 
  // Core
  buildBaseConfig(): Promise<SnapshotConfig<T, K, Meta, ExcludedFields>>;
  buildStoreMethods(): Promise<StoreMethods<T, K, Meta, ExcludedFields>>;
  buildEventHandlers(): Promise<EventHandlers<T, K, Meta, ExcludedFields>>;
  buildSnapshotStore(): Promise<EventStore<T, K, Meta, ExcludedFields>>;
  buildSnapshotUnion(data: T, related?: K[]): Promise<SnapshotUnion<T, K, Meta, ExcludedFields>>;
  buildLifecycle(): Promise<SnapshotLifecycle<T, K, Meta, ExcludedFields>>;
  buildMeta(): Promise<SnapshotMeta<T, K, Meta, ExcludedFields>>;

  // Extended
  buildStoreConfig(): Promise<SnapshotStoreConfig<T, K, Meta, ExcludedFields>>;
  buildSnapshotEvents(): Promise<SnapshotEvents<T, K, Meta, ExcludedFields>>;
  buildContainer(): Promise<SnapshotContainer<T, K, Meta, ExcludedFields>>;
  buildSubscribers(): Promise<SnapshotSubscriberManagement<T, K, Meta, ExcludedFields>>;
  buildWithCriteria(): Promise<SnapshotWithCriteria<T, K, Meta, ExcludedFields>>;
  buildManager(): Promise<SnapshotManager<T, K, Meta, ExcludedFields>>;
}


export type { SnapshotConfigParams, SnapshotLifecycle };


// Initialize builder
const builder: SnapshotConfigBuilder<SnapshotConfigParams> = {
  buildBaseConfig: async (params) => ({

    deleted, initialConfig, onInitialize, taskIdToAssign,



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
