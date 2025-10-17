// TaskEntity.ts
import { AppMetadata } from '@/config/MetaDataOptions';

import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Comment } from "@/app/models/comments/Comments";
import { BaseData } from '@/app/models/data/Data';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { AllStatus } from '@/app/state/stores/DetailsListStore';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { User } from '@/app/users/User';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from '@/config/MetaDataOptions';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { BaseTaskEntity } from '@/app/models/tasks/Task'


// 2. Type definitions with 6 parameters
type TaskEntity = BaseTaskEntity;
type TaskK = BaseTaskEntity;
type TaskMeta = DefaultMeta<BaseTaskEntity, TaskK>;
type TaskAttachment = Attachment;
type TaskExcludedFields = DefaultExcludedFields<BaseTaskEntity>;
type TaskIncludedFields = keyof BaseTaskEntity;

// 3. App Metadata
type AppTaskMetadata = AppMetadata<
  BaseTaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 4. Structured & Unified Metadata
type TaskStructuredMetadata = StructuredMetadata<
  BaseTaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

type TaskUnifiedMetadata = UnifiedMetadata<
  BaseTaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;


// 5. Parameters container
type TaskBaseParams = {
  T: BaseTaskEntity;
  K: TaskK;
  Meta: TaskMeta;
  AttachmentType: TaskAttachment;
  ExcludedFields: TaskExcludedFields;
  IncludedFields: TaskIncludedFields;
};

// 6. Snapshot types
type TaskSnapshot = Snapshot<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotData = SnapshotData<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotStore = SnapshotStore<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotWithCriteria = SnapshotWithCriteria<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSubscriberCollection = SubscriberCollection<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskRealtimeDataItem = RealtimeDataItem<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 7. Config types
type TaskSnapshotStoreConfig = SnapshotStoreConfig<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotsArray = SnapshotsArray<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskParams = SnapshotConfigParams<BaseTaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 8. Utility
type ApplyTaskFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
  ApplyTaskFieldFilters, AppTaskMetadata, TaskAttachment, TaskBaseParams,
  TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK,
  TaskMeta, TaskParams, TaskRealtimeDataItem, TaskSnapshot, TaskSnapshotData, TaskSnapshotsArray, TaskSnapshotStore, TaskSnapshotStoreConfig, TaskSnapshotWithCriteria, TaskStructuredMetadata, TaskSubscriberCollection, TaskUnifiedMetadata
};

