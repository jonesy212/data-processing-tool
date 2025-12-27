// SubscriberEntity.ts
// SubscriberEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';

// Core Subscriber type definitions
type SubscriberEntity = BaseDataEntity & {
  // Add subscriber-specific properties that extend BaseDataEntity
  email: string;
  isActive: boolean;
  subscriptionType: string;
  preferences?: Record<string, any>;
  lastNotifiedAt?: Date;
  notificationCount: number;
};

type SubscriberK = SubscriberEntity;
type SubscriberMeta = DefaultMeta<SubscriberEntity, SubscriberK>;
type SubscriberAttachment = Attachment;
type SubscriberExcludedFields = DefaultExcludedFields<SubscriberEntity>;
type SubscriberIncludedFields = keyof SubscriberEntity;

// Main parameters container
type SubscriberBaseParams = {
  T: SubscriberEntity;
  K: SubscriberK;
  Meta: SubscriberMeta;
  AttachmentType: SubscriberAttachment;
  ExcludedFields: SubscriberExcludedFields;
  IncludedFields: SubscriberIncludedFields;
};

// Core snapshot types
type SubscriberSnapshot = Snapshot<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberSnapshotData = SnapshotData<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberSnapshotStore = SnapshotStore<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberSnapshotWithCriteria = SnapshotWithCriteria<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberSubscriberCollection = SubscriberCollection<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberRealtimeDataItem = RealtimeDataItem<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;

// Configuration types
type SubscriberSnapshotStoreConfig = SnapshotStoreConfig<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;
type SubscriberSnapshotsArray = SnapshotsArray<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;

// PARAMS
type SubscriberParams = SnapshotConfigParams<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>;

// Utility to pick or omit fields dynamically
type ApplySubscriberFieldFilters<
  Excluded extends keyof SubscriberEntity = never,
  Included extends Exclude<keyof SubscriberEntity, Excluded> = Exclude<keyof SubscriberEntity, Excluded>
> = Pick<Omit<SubscriberEntity, Excluded>, Included>;

export type {
    ApplySubscriberFieldFilters, SubscriberAttachment,
    SubscriberBaseParams,
    SubscriberEntity,
    SubscriberExcludedFields,
    SubscriberIncludedFields,
    SubscriberK, SubscriberMeta,
    SubscriberParams,
    SubscriberRealtimeDataItem,
    SubscriberSnapshot,
    SubscriberSnapshotData,
    SubscriberSnapshotsArray,
    SubscriberSnapshotStore,
    SubscriberSnapshotStoreConfig,
    SubscriberSnapshotWithCriteria,
    SubscriberSubscriberCollection
};

