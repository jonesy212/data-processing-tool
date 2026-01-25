// SnapshotConfigBuilder.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { EventStore } from "@/core/events/EventStore";
import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { SnapshotManager } from "@/core/hooks/useSnapshotManager";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { Data } from '@/core/models/data/Data';
import type { StoreMethods } from "@/core/models/tasks/StoreMethods";
import type { CriteriaType } from "@/core/pages/searches/CriteriaType";
import type { SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import type { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { InitializedData, SnapshotInstanceProps } from "@/core/snapshots/SnapshotStoreOptions";
import type { storeProps } from "@/core/snapshots/SnapshotStoreProps";
import type { SnapshotSubscriberManagement } from "@/core/snapshots/SnapshotSubscriberManagement";
import type { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import type { SnapshotMeta } from "@/core/typings/entities/SnapshotEntity";
import type { SnapshotEvents } from '@/core/typings/snapshotTypes';
import { createLatestVersion } from '@/core/versions/createLatestVersion';

import type { EventHandlers } from '@/core/libraries/eventSystem/eventHandlers';

interface SnapshotLifecycle<T extends BaseDataEntity> {
  initializeWithData<T>(data: SnapshotUnion<T, any, any, any, any, any>[]): void;
  clear(): void;
}

type SnapshotConfigParams<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  // Extras extends unknown[] = [] // Allow flexible extension
  > = [T, K, Meta, AttachmentType, ExcludedFields, IncludedFields
    // ...Extras
  ];


// ✅ Simulated Data Source that expands from params tuple
interface SimulatedDataSourceFromParams<
  Params extends SnapshotConfigParams<any, any, any, any, any, any> = SnapshotConfigParams
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
  T extends BaseDataEntity = BaseDataEntity,
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
// Initialize builder with all properties from your original implementation
const builder: SnapshotConfigBuilder<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity> = {
  // Required getter methods
  getType: () => ({} as BaseDataEntity),
  getKey: () => ({} as BaseDataEntity),
  getMeta: () => ({} as DefaultMeta<BaseDataEntity, BaseDataEntity>),
  getExcluded: () => [] as DefaultExcludedFields<BaseDataEntity>[],
  getIncluded: () => [] as (keyof BaseDataEntity)[],

  // Optional createConfig method
  createConfig: (params) => {
    // Implement based on your needs
    return {} as SnapshotStoreConfig<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity>;
  },

  // Core builder methods
  buildBaseConfig: async () => {
    // You'll need to define or get these variables
    const generateId = undefined; // or define this function
    const currentCategory = 'default' as Category;
    const unifiedMetadata = undefined;
    const structuredMetadata = undefined;
    const criteria = 'default-criteria' as CriteriaType;
    const priority = 'normal';
    const baseData = {} as BaseDataEntity;
    const snapshotStoreConfig = undefined;
    const initialState = {};
    const additionalData = undefined;
    const baseMeta = {} as DefaultMeta<BaseDataEntity, BaseDataEntity>;

    return {
      // Properties from Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
      data: baseData as InitializedData<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity>,
      subscribers: [],
      storeConfig: snapshotStoreConfig,
      initialState: initialState || {},
      isCore: true,
      additionalData: additionalData,
      hasSnapshots: async () => false,

      // Additional props from your original code
      baseData,
      baseMeta,
      props: storeProps!,
      deleted: false,
      initialConfig: '',
      onInitialize: (callback: () => void) => {},
      taskIdToAssign: '',
      latestVersion: '',
      schema: '',
      currentCategory: '',
      mappedSnapshotData: new Map(), // This was missing
      storeId: '',
      versionInfo: '',
      initializedState: '',
      snapshotContainer: undefined,
      config: '',
      
      // Required Snapshot interface properties (simplified for now)
      snapshots: [],
      compareSnapshotState: () => false,
      eventRecords: null,
      getParentId: () => '',
      getChildIds: () => [],
      addChild: () => {},
      removeChild: () => {},
      getChildren: () => [],
      hasChildren: () => false,
      isDescendantOf: () => false,
      dataItems: [],
      newData: {} as BaseDataEntity,
      stores: null,
      getStore: () => null,
      addStore: () => {},
      removeStore: () => {},
      createSnapshots: () => Promise.resolve([]),
      events: {
        eventRecords: null,
        callbacks: {},
        subscribers: [],
        eventIds: [],
        on: () => {},
        off: () => {},
        emit: () => {},
        once: () => {},
        subscribe: () => {},
        unsubscribe: () => {},
        trigger: () => {},
        removeAllListeners: () => {},
        onSnapshotAdded: () => {},
        onSnapshotRemoved: () => {},
        onSnapshotUpdated: () => {},
        addRecord: () => {},
      },
      meta: {
        description: undefined,
        fileType: '',
        alternatePaths: [],
        originalPath: '',
        metadataEntries: {},
        keywords: '',
        childIds: undefined,
        relatedData: undefined,
        version: {
          id: 1,
          versionData: null,
          buildVersions: undefined,
          isActive: true,
          releaseDate: new Date(),
          major: 1,
          minor: 0,
          patch: 0,
          name: 'Initial Version',
          url: '',
          versionNumber: '1.0.0',
          documentId: '',
          draft: false,
          userId: '',
          content: '',
          description: 'Initial release',
          buildNumber: '',
          metadata: {},
          versions: null,
          appVersion: '1.0.0',
          checksum: '',
          parentId: null,
          parentType: '',
          parentVersion: '',
          parentTitle: '',
          parentContent: '',
          parentName: '',
          parentUrl: '',
          parentChecksum: '',
          parentAppVersion: '',
          parentVersionNumber: '',
          parentMetadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          isLatest: true,
          isPublished: true,
          publishedAt: new Date(),
          source: '',
          status: 'active',
          workspaceId: '',
          workspaceName: '',
          workspaceType: '',
          workspaceUrl: '',
          workspaceViewers: [],
          workspaceAdmins: [],
          workspaceMembers: [],
          data: undefined,
          _structure: {},
          versionHistory: { versionData: {} },
          getVersionNumber: undefined,
          updateStructureHash: async () => {},
          setStructureData: () => {},
          hash: () => '',
          currentHash: '',
          structureData: '',
          calculateHash: () => '',
        },
        lastUpdated: undefined,
        isActive: true,
        config: {},
        permissions: [],
        customFields: {},
        baseUrl: '',
        versionData: [],
        latestVersion: createLatestVersion<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity>(),
      },
      snapshot: async () => ({ snapshot: {} as any }),
      baseConfig: {},
      sharedMetadata: {},
      sharedBaseData: {}, 
      taggable: {}, 
      timestamp: new Date(),
    } as SnapshotConfig<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, Attachment, DefaultExcludedFields<BaseDataEntity>, keyof BaseDataEntity>
  },

  buildStoreMethods: async () => ({} as any),
  buildEventHandlers: async () => ({} as any),
  buildSnapshotStore: async () => ({} as any),
  buildSnapshotUnion: async (data: BaseDataEntity, related?: BaseDataEntity[]) => ({} as any),
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
