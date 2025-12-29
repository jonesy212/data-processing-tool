// MetaEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { AppMetadata } from '@/core/typings/metadataTypes';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

// 1. Define your base metadata entity (adjust according to your actual base entity)
interface BaseMetaEntity extends BaseDataEntity {
  // Add metadata-specific properties
  key: string;
  value: any;
  dataType: string;
  category?: string;
  // ... other metadata properties
}

// 2. Type definitions with 6 parameters
type MetaEntity = BaseMetaEntity;
type MetaK = BaseMetaEntity;
type MetaMeta = DefaultMeta<BaseMetaEntity, MetaK>;
type MetaAttachment = Attachment;
type MetaExcludedFields = DefaultExcludedFields<BaseMetaEntity>;
type MetaIncludedFields = keyof BaseMetaEntity;

// 3. App Metadata
type AppMetaMetadata = AppMetadata<
  BaseMetaEntity,
  MetaK,
  MetaMeta,
  MetaAttachment,
  MetaExcludedFields,
  MetaIncludedFields
>;

// 4. Structured & Unified Metadata
type MetaStructuredMetadata = StructuredMetadata<
  BaseMetaEntity,
  MetaK,
  MetaMeta,
  MetaAttachment,
  MetaExcludedFields,
  MetaIncludedFields
>;

type MetaUnifiedMetadata = UnifiedMetadata<
  BaseMetaEntity,
  MetaK,
  MetaMeta,
  MetaAttachment,
  MetaExcludedFields,
  MetaIncludedFields
>;

// 5. Parameters container
type MetaBaseParams = {
  T: BaseMetaEntity;
  K: MetaK;
  Meta: MetaMeta;
  AttachmentType: MetaAttachment;
  ExcludedFields: MetaExcludedFields;
  IncludedFields: MetaIncludedFields;
};

// 6. Snapshot types
type MetaSnapshot = Snapshot<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaSnapshotData = SnapshotData<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaSnapshotStore = SnapshotStore<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaSnapshotWithCriteria = SnapshotWithCriteria<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaSubscriberCollection = SubscriberCollection<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaRealtimeDataItem = RealtimeDataItem<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaCollection = MetaEntity[];

// 7. Config types
type MetaSnapshotStoreConfig = SnapshotStoreConfig<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaSnapshotsArray = SnapshotsArray<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;
type MetaParams = SnapshotConfigParams<BaseMetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;

// 8. Utility
type ApplyMetaFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

// 9. If you have a specific Meta class/interface (like Task<T>), export it here
// export type AppMeta = Meta<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>;

export type {
    ApplyMetaFieldFilters, AppMetaMetadata, BaseMetaEntity, MetaAttachment, MetaBaseParams,
    MetaCollection, MetaEntity, MetaExcludedFields,
    MetaIncludedFields, MetaK,
    MetaMeta, MetaParams,
    MetaRealtimeDataItem,
    MetaSnapshot,
    MetaSnapshotData,
    MetaSnapshotsArray,
    MetaSnapshotStore,
    MetaSnapshotStoreConfig,
    MetaSnapshotWithCriteria,
    MetaStructuredMetadata,
    MetaSubscriberCollection,
    MetaUnifiedMetadata
};

