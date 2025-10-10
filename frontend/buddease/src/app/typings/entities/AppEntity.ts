// AppEntity.ts
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

// Core App type definitions
type AppEntity = BaseDataEntity;
type AppK = AppEntity;
type AppMeta = DefaultMeta<AppEntity, AppK>;
type AppAttachment = Attachment;
type AppExcludedFields = DefaultExcludedFields<AppEntity>;
type AppIncludedFields = keyof AppEntity;

// Main parameters container
type AppBaseParams = {
  T: AppEntity;
  K: AppK;
  Meta: AppMeta;
  AttachmentType: AppAttachment;
  ExcludedFields: AppExcludedFields;
  IncludedFields: AppIncludedFields;
};

// Helper type to extract UnifiedMetadata with App types
type AppUnifiedMetadata = UnifiedMetadata<
  AppBaseParams['T'],
  AppBaseParams['K'], 
  AppBaseParams['Meta'],
  AppBaseParams['AttachmentType'],
  AppBaseParams['ExcludedFields'],
  AppBaseParams['IncludedFields']
>;

// Helper type for StructuredMetadata
type AppStructuredMetadata = StructuredMetadata<
  AppBaseParams['T'],
  AppBaseParams['K'],
  AppBaseParams['Meta'],
  AppBaseParams['AttachmentType'],
  AppBaseParams['ExcludedFields'],
  AppBaseParams['IncludedFields']
>;

// Core snapshot types (FIXED: AppIncludedFields instead of AppIncludeField)
type AppSnapshot = Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppSnapshotData = SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppSnapshotStore = SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppSnapshotWithCriteria = SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppSubscriberCollection = SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppRealtimeDataItem = RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

// Configuration types
type AppSnapshotStoreConfig = SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppSnapshotsArray = SnapshotsArray<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

// PARAMS
type AppParams = SnapshotConfigParams<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

// Utility to pick or omit fields dynamically (GENERIC - no UserEntity reference)
type ApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
  > = Pick<Omit<T, Excluded>, Included>;


export type {
    AppAttachment, AppBaseParams, AppEntity, AppExcludedFields,
    AppIncludedFields, AppK, ApplyFieldFilters, AppMeta, AppParams, AppRealtimeDataItem, AppSnapshot,
    AppSnapshotData, AppSnapshotsArray, AppSnapshotStore, AppSnapshotStoreConfig, AppSnapshotWithCriteria, AppStructuredMetadata, AppSubscriberCollection, AppUnifiedMetadata
};

