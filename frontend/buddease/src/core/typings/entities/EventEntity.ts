// EventEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotsArray } from "@/core/snapshots/LocalStorageSnapshotStore";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from "@/core/snapshots/SnapshotConfigBuilder";
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import type { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";
;

// Core Event type definitions
type EventEntity = BaseDataEntity; // You can later specialize this (e.g. EventBase, CalendarEvent, etc.)
type EventK = EventEntity;
type EventMeta = DefaultMeta<EventEntity, EventK>;
type EventAttachment = Attachment;
type EventExcludedFields = DefaultExcludedFields<EventEntity>;
type EventIncludedFields = keyof EventEntity;

// Main parameters container
type EventBaseParams = {
  T: EventEntity;
  K: EventK;
  Meta: EventMeta;
  AttachmentType: EventAttachment;
  ExcludedFields: EventExcludedFields;
  IncludedFields: EventIncludedFields;
};

// Core snapshot types
type EventSnapshot = Snapshot<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventSnapshotData = SnapshotData<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventSnapshotStore = SnapshotStore<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventSnapshotWithCriteria = SnapshotWithCriteria<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventSubscriberCollection = SubscriberCollection<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventRealtimeDataItem = RealtimeDataItem<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;

// Configuration types
type EventSnapshotStoreConfig = SnapshotStoreConfig<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;
type EventSnapshotsArray = SnapshotsArray<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;

// PARAMS
type EventParams = SnapshotConfigParams<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;

// Utility to pick or omit fields dynamically
type ApplyEventFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

// Exports
export type {
    ApplyEventFieldFilters, EventAttachment, EventBaseParams, EventEntity, EventExcludedFields,
    EventIncludedFields, EventK,
    EventMeta, EventParams, EventRealtimeDataItem, EventSnapshot,
    EventSnapshotData,
    EventSnapshotsArray,
    EventSnapshotStore,
    EventSnapshotStoreConfig,
    EventSnapshotWithCriteria,
    EventSubscriberCollection
};

