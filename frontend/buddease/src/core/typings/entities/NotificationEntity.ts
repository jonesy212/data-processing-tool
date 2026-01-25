// NotificationEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import type { NotificationContextProps } from '@/core/state/context/NotificationContext';
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';

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

type AppNotificationProps = NotificationContextProps<NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields>;

// 7. Utility: Field filters
type ApplyNotificationFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
    ApplyNotificationFieldFilters, AppNotificationProps, NotificationAttachment, NotificationBaseParams, NotificationEntity, NotificationExcludedFields,
    NotificationIncludedFields, NotificationK,
    NotificationMeta, NotificationParams,
    NotificationSnapshot, NotificationSnapshotData, NotificationSnapshotsArray, NotificationSnapshotStore,
    NotificationSnapshotStoreConfig,
    NotificationSnapshotWithCriteria, NotificationStructuredMetadata, NotificationSubscriberCollection, NotificationUnifiedMetadata
};

