// TaskEntity.ts
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Permission } from '@/core/permissions/Permission';

import type { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { PriorityTypeEnum } from "@/core/models/data/StatusType";
import type { Task } from '@/core/models/tasks/Task';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import type { AllStatus } from "@/core/state/stores/DetailsListStore";
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { AppMetadata } from '@/core/typings/metadataTypes';
import type { RealtimeDataItem } from '@/core/typings/realtimeTypes';

interface TaskEntity extends BaseEntity<AppMetadata<AppTaskMetadata>> {
  name: string;
  status?: AllStatus;
  priority?: PriorityTypeEnum;
  dueDate?: Date;
  isComplete?: boolean;
  startDate?: Date;
  endDate?: Date;
  userId?: string | null;
  projectName?: string;
}


// 1a. Extended model (K)
interface TaskEntityExtended extends TaskEntity {
  ownerId: string;
  permissions: Permission[];
}

// 2. Type definitions with 6 parameters
type TaskK = TaskEntityExtended;
type TaskMeta = DefaultMeta<TaskEntity, TaskK>;
type TaskAttachment = Attachment;
type TaskExcludedFields = DefaultExcludedFields<TaskEntity>;
type TaskIncludedFields = keyof TaskEntity;


// 3. App Metadata
type AppTaskMetadata = AppMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 4. Structured & Unified Metadata
type TaskStructuredMetadata = StructuredMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

type TaskUnifiedMetadata = UnifiedMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;


// 5. Parameters container
type TaskBaseParams = {
  T: TaskEntity;
  K: TaskK;
  Meta: TaskMeta;
  AttachmentType: TaskAttachment;
  ExcludedFields: TaskExcludedFields;
  IncludedFields: TaskIncludedFields;
};

// 6. Snapshot types
type TaskSnapshot = Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotData = SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotStore = SnapshotStore<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotWithCriteria = SnapshotWithCriteria<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSubscriberCollection = SubscriberCollection<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskRealtimeDataItem = RealtimeDataItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskCollection = TaskEntity[];

// 7. Config types
type TaskSnapshotStoreConfig = SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotsArray = SnapshotsArray<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskParams = SnapshotConfigParams<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 8. Utility
type ApplyTaskFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;


export type AppTask = Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

export type {
    ApplyTaskFieldFilters,
    AppTaskMetadata, TaskAttachment, TaskBaseParams,
    TaskCollection, TaskEntity, TaskExcludedFields,
    TaskIncludedFields, TaskK,
    TaskMeta, TaskParams, TaskRealtimeDataItem,
    TaskSnapshot, TaskSnapshotData,
    TaskSnapshotsArray, TaskSnapshotStore,
    TaskSnapshotStoreConfig,
    TaskSnapshotWithCriteria,
    TaskStructuredMetadata,
    TaskSubscriberCollection,
    TaskUnifiedMetadata
};

