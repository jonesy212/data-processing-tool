// NotificationEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { UnifiedMetadata } from '@/config/MetaDataOptions';

// 1. Base entity
type NotificationEntity = BaseDataEntity;

// 2. Generics for notification system
type NotificationK = NotificationEntity;
type NotificationMeta = DefaultMeta<NotificationEntity, NotificationK>;
type NotificationAttachment = Attachment;
type NotificationExcludedFields = DefaultExcludedFields<NotificationEntity>;
type NotificationIncludedFields = keyof NotificationEntity;

// 3. Structured & Unified Metadata
type NotificationStructuredMetadata = StructuredMetadata<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationUnifiedMetadata = UnifiedMetadata<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

// 4. Parameters container
type NotificationBaseParams = {
  T: NotificationEntity;
  K: NotificationK;
  Meta: NotificationMeta;
  AttachmentType: NotificationAttachment;
  ExcludedFields: NotificationExcludedFields;
  IncludedFields: NotificationIncludedFields;
};

// 5. Snapshot types
type NotificationSnapshot = Snapshot<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationSnapshotData = SnapshotData<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationSnapshotStore = SnapshotStore<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationSnapshotWithCriteria = SnapshotWithCriteria<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationSubscriberCollection = SubscriberCollection<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

// 6. Config types
type NotificationSnapshotStoreConfig = SnapshotStoreConfig<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationSnapshotsArray = SnapshotsArray<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

type NotificationParams = SnapshotConfigParams<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

// 7. Utility: Field filters
type ApplyNotificationFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields,
  NotificationBaseParams,
  NotificationSnapshot,
  NotificationSnapshotData,
  NotificationSnapshotStore,
  NotificationSnapshotStoreConfig,
  NotificationSnapshotWithCriteria,
  NotificationSnapshotsArray,
  NotificationSubscriberCollection,
  NotificationStructuredMetadata,
  NotificationUnifiedMetadata,
  NotificationParams,
  ApplyNotificationFieldFilters
};
