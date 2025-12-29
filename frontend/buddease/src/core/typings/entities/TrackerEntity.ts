// TrackerEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

// Core Tracker type definitions
type TrackerEntity = BaseDataEntity & {
  // Tracker-specific fields
  trackerName: string;
  strokeWidth?: number;
  fillColor?: string;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  position?: { x: number; y: number };
  phases?: Phase[];
  // Add other tracker-specific properties as needed
};
type TrackerK = TrackerEntity;
type TrackerMeta = DefaultMeta<TrackerEntity, TrackerK>;
type TrackerAttachment = Attachment;
type TrackerExcludedFields = DefaultExcludedFields<TrackerEntity>;
type TrackerIncludedFields = keyof TrackerEntity;

// Main parameters container
type TrackerBaseParams = {
  T: TrackerEntity;
  K: TrackerK;
  Meta: TrackerMeta;
  AttachmentType: TrackerAttachment;
  ExcludedFields: TrackerExcludedFields;
  IncludedFields: TrackerIncludedFields;
};

// Snapshot types
type TrackerSnapshot = Snapshot<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerSnapshotData = SnapshotData<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerSnapshotStore = SnapshotStore<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerSnapshotWithCriteria = SnapshotWithCriteria<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerSubscriberCollection = SubscriberCollection<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerRealtimeDataItem = RealtimeDataItem<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;

// Configuration types
type TrackerSnapshotStoreConfig = SnapshotStoreConfig<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;
type TrackerSnapshotsArray = SnapshotsArray<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;

// PARAMS
type TrackerParams = SnapshotConfigParams<TrackerEntity, TrackerK, TrackerMeta, TrackerAttachment, TrackerExcludedFields, TrackerIncludedFields>;

// Utility to pick or omit fields dynamically
type ApplyTrackerFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
    ApplyTrackerFieldFilters, TrackerAttachment, TrackerBaseParams, TrackerEntity, TrackerExcludedFields, TrackerIncludedFields, TrackerK,
    TrackerMeta, TrackerParams,
    TrackerRealtimeDataItem, TrackerSnapshot, TrackerSnapshotData, TrackerSnapshotsArray,
    TrackerSnapshotStore, TrackerSnapshotStoreConfig, TrackerSnapshotWithCriteria,
    TrackerSubscriberCollection
};

