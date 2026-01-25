// AppEntity.ts
import AppStructure from '@/core/config/appStructure/AppStructure';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { RealtimeDataItem } from '@/core/typings/realtimeTypes';

// Core App type definitions
interface AppEntity extends BaseDataEntity {
  // Common app-level properties
  appId: string;
  appName: string;
  version: string;
  environment?: 'development' | 'staging' | 'production' | 'test' | string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'maintenance';
}

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
type MainApp = AppStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
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
  AppEntity,
  AppK,
  AppMeta,
  AppAttachment,
  AppExcludedFields,
  AppIncludedFields,
  ApplyFieldFilters,
  AppParams,
  AppBaseParams,
  AppRealtimeDataItem,
  AppSnapshot,
  AppSnapshotData,
  AppSnapshotsArray,
  AppSnapshotStore,
  AppSnapshotStoreConfig,
  AppSnapshotWithCriteria,
  AppSubscriberCollection,
  MainApp
};

